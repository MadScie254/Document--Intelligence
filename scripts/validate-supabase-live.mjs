import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function loadEnvFromFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const unquoted = rawValue.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

    if (!process.env[key]) {
      process.env[key] = unquoted;
    }
  }
}

function mustGetEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function assertResult(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  loadEnvFromFile('.env.local');

  const supabaseUrl = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRole = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const emailId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const tempEmail = `flowforge.validate.${emailId}@example.com`;
  const tempPassword = `Valid@${Math.floor(Math.random() * 10000000)}x`;

  let userId = null;
  let workflowId = null;
  let runId = null;
  let uploadedPath = null;

  try {
    console.log('1) Creating temporary auth user...');
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true
    });
    if (createUserError) {
      throw createUserError;
    }

    userId = createdUser.user?.id ?? null;
    assertResult(Boolean(userId), 'Failed to create temporary user.');

    console.log('2) Inserting workflow row...');
    const workflowTitle = `Validation Workflow ${randomUUID().slice(0, 8)}`;
    const workflowPayload = {
      user_id: userId,
      title: workflowTitle,
      description: 'Live validation workflow',
      output_format: 'pdf',
      fields: [
        {
          key: 'name',
          label: 'Name',
          type: 'text',
          required: true
        }
      ],
      template: 'Hello {{name}}',
      email_to: null,
      is_active: true
    };

    const { data: workflowInsert, error: workflowInsertError } = await supabase
      .from('workflows')
      .insert(workflowPayload)
      .select('id,title,user_id')
      .single();

    if (workflowInsertError) {
      throw workflowInsertError;
    }

    workflowId = workflowInsert.id;
    assertResult(workflowInsert.user_id === userId, 'Workflow user_id mismatch.');

    console.log('3) Reading workflow row...');
    const { data: workflowRead, error: workflowReadError } = await supabase
      .from('workflows')
      .select('id,title,fields,template')
      .eq('id', workflowId)
      .single();

    if (workflowReadError) {
      throw workflowReadError;
    }

    assertResult(workflowRead.template === 'Hello {{name}}', 'Workflow template was not persisted correctly.');

    console.log('4) Updating workflow row...');
    const { data: workflowUpdate, error: workflowUpdateError } = await supabase
      .from('workflows')
      .update({ title: `${workflowTitle} Updated` })
      .eq('id', workflowId)
      .select('id,title')
      .single();

    if (workflowUpdateError) {
      throw workflowUpdateError;
    }

    assertResult(workflowUpdate.title.endsWith('Updated'), 'Workflow update did not apply.');

    console.log('5) Inserting pending run row...');
    const { data: runInsert, error: runInsertError } = await supabase
      .from('runs')
      .insert({
        workflow_id: workflowId,
        user_id: userId,
        data: { name: 'Live Validation' },
        output_format: 'pdf',
        status: 'pending'
      })
      .select('id,status')
      .single();

    if (runInsertError) {
      throw runInsertError;
    }

    runId = runInsert.id;
    assertResult(runInsert.status === 'pending', 'Run was not created in pending status.');

    console.log('6) Uploading run output file to Storage...');
    uploadedPath = `${userId}/${runId}.pdf`;
    const fileBytes = new TextEncoder().encode('FlowForge validation artifact');
    const { error: uploadError } = await supabase.storage.from('run-outputs').upload(uploadedPath, fileBytes, {
      contentType: 'application/pdf',
      upsert: true
    });

    if (uploadError) {
      throw uploadError;
    }

    console.log('7) Finalizing run row and checking signed URL...');
    const { data: runUpdate, error: runUpdateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        file_path: uploadedPath,
        file_name: `validation_${runId}.pdf`
      })
      .eq('id', runId)
      .select('id,status,file_path')
      .single();

    if (runUpdateError) {
      throw runUpdateError;
    }

    assertResult(runUpdate.status === 'complete', 'Run update did not set complete status.');

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('run-outputs')
      .createSignedUrl(uploadedPath, 60);

    if (signedUrlError) {
      throw signedUrlError;
    }

    assertResult(Boolean(signedUrlData?.signedUrl), 'Failed to generate signed URL for uploaded output.');

    console.log('8) Cleaning up temporary records...');

    const { error: runDeleteError } = await supabase.from('runs').delete().eq('id', runId);
    if (runDeleteError) {
      throw runDeleteError;
    }
    runId = null;

    const { error: workflowDeleteError } = await supabase.from('workflows').delete().eq('id', workflowId);
    if (workflowDeleteError) {
      throw workflowDeleteError;
    }
    workflowId = null;

    const { error: objectDeleteError } = await supabase.storage.from('run-outputs').remove([uploadedPath]);
    if (objectDeleteError) {
      throw objectDeleteError;
    }
    uploadedPath = null;

    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(userId);
    if (userDeleteError) {
      throw userDeleteError;
    }
    userId = null;

    console.log('Validation succeeded: CRUD + run flow + storage checks passed.');
  } catch (error) {
    console.error('Validation failed.');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    throw error;
  } finally {
    if (uploadedPath) {
      await supabase.storage.from('run-outputs').remove([uploadedPath]);
    }

    if (runId) {
      await supabase.from('runs').delete().eq('id', runId);
    }

    if (workflowId) {
      await supabase.from('workflows').delete().eq('id', workflowId);
    }

    if (userId) {
      await supabase.auth.admin.deleteUser(userId);
    }
  }
}

main().catch(() => {
  process.exit(1);
});
