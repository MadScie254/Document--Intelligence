'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { RunForm } from '@/components/run/RunForm';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { resolveTemplate } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';
import { generateDOCX } from '@/lib/docx';
import type { Run, Workflow } from '@/types';

type RunStep = 'idle' | 'generating' | 'uploading' | 'emailing' | 'done' | 'error';

export default function RunWorkflowPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useToast();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<RunStep>('idle');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', params.id)
        .single();

      if (workflowError || !workflowData) {
        notify('Workflow not found.', 'error');
        router.replace('/workflows');
        return;
      }

      setWorkflow(workflowData as Workflow);

      const sourceRunId = searchParams.get('sourceRun');
      if (sourceRunId) {
        const { data: runData } = await supabase.from('runs').select('*').eq('id', sourceRunId).single();
        if (runData?.data) {
          setInitialValues(runData.data as Record<string, string | number>);
        }
      }

      setLoading(false);
    };

    load();
  }, [notify, params.id, router, searchParams]);

  const stepMessage = useMemo(() => {
    if (step === 'generating') return 'Generating document...';
    if (step === 'uploading') return 'Uploading to secure storage...';
    if (step === 'emailing') return 'Dispatching email...';
    if (step === 'done') return 'Completed.';
    if (step === 'error') return 'Run failed.';
    return '';
  }, [step]);

  if (loading || !workflow) {
    return <Card className="p-6 text-sm text-gray-500">Loading workflow...</Card>;
  }

  const handleRun = async (values: Record<string, string | number>) => {
    const supabase = createClient();
    let runId: string | undefined;

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User session not found');
      }

      const { data: newRun, error: runError } = await supabase
        .from('runs')
        .insert({
          workflow_id: workflow.id,
          user_id: user.id,
          data: values,
          output_format: workflow.output_format,
          status: 'pending'
        })
        .select('id')
        .single();

      if (runError || !newRun) {
        throw runError;
      }

      runId = newRun.id;

      setStep('generating');
      const resolved = resolveTemplate(workflow.template, values);
      const extension = workflow.output_format === 'pdf' ? 'pdf' : 'docx';
      const blob =
        workflow.output_format === 'pdf'
          ? await generatePDF(workflow.title, resolved, values)
          : await generateDOCX(workflow.title, resolved);

      setStep('uploading');
      const filePath = `${user.id}/${runId}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('run-outputs').upload(filePath, blob, {
        contentType:
          workflow.output_format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true
      });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from('runs')
        .update({
          status: 'complete',
          file_path: filePath,
          file_name: `${workflow.title}_${runId}.${extension}`
        })
        .eq('id', runId);

      if (updateError) {
        throw updateError;
      }

      if (workflow.email_to) {
        setStep('emailing');
        const recipients = workflow.email_to
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: recipients,
              subject: workflow.title,
              body: resolved,
              runId
            })
          });

          if (!emailResponse.ok) {
            throw new Error('Email dispatch failed');
          }

          await supabase
            .from('runs')
            .update({
              email_sent_to: recipients.join(', '),
              email_sent_at: new Date().toISOString()
            })
            .eq('id', runId);
        } catch {
          await supabase
            .from('runs')
            .update({
              error_message: 'Email dispatch failed.'
            })
            .eq('id', runId);
        }
      }

      setStep('done');
      notify('Workflow run completed.', 'success');
      router.push(`/runs/${runId}`);
      router.refresh();
    } catch {
      if (runId) {
        await supabase.from('runs').update({ status: 'failed', error_message: 'Run generation failed.' }).eq('id', runId);
      }
      setStep('error');
      notify('Run failed. Please retry.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Run Workflow</h1>
        <p className="text-sm text-gray-500">{workflow.title}</p>
      </div>

      <RunForm workflow={workflow} initialValues={initialValues} loading={step !== 'idle'} onSubmit={handleRun} />

      {step !== 'idle' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
          <div className="rounded-xl bg-white p-5 text-center shadow-xl">
            <p className="text-sm font-medium text-gray-800">{stepMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
