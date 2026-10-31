import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import subprocess
import concurrent.futures
import os
from unittest.mock import patch
import checkpoint_ep2 as checkpoint


class CheckpointTest(unittest.TestCase):
    def test_concurrent_answers_keep_all_paid_receipts(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            calls = {str(i):{'status':'dispatching','model':'technical-only','reservedUsd':0.001,'costUsd':None} for i in range(16)}
            (root/'ledger.json').write_text(json.dumps({'budgetUsd':2,'calls':calls}))
            bridge = Path(checkpoint.__file__).with_name('ponte_ep2.py')
            def install(i):
                return subprocess.run(['python3',str(bridge),'answer'],input=json.dumps({'id':str(i),'ok':True,'text':'technical test only','generationId':'synthetic-test-'+str(i),'costUsd':0}),text=True,capture_output=True,env={**os.environ,'LOBO_EP2_SPOOL':directory})
            with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
                results=list(pool.map(install,range(16)))
            for result in results:
                self.assertEqual(result.returncode,0,result.stderr)
            saved=json.loads((root/'ledger.json').read_text())
            self.assertEqual(sum(c['status']=='completed' for c in saved['calls'].values()),16)
            self.assertEqual(len(list((root/'audit').glob('*.json'))),16)

    def test_roundtrip_rejects_conflict_and_preserves_both_versions(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'lobisomem/.spool_ep2/audit/decision.json'
            source.parent.mkdir(parents=True)
            original = '{"ok":true,"generationId":"technical-only"}'
            source.write_text(original)
            target = root / 'lobisomem/recovery/checkpoints/current.json'
            with patch.object(checkpoint, 'ROOT', root), patch.object(checkpoint, 'DEST', target), patch.object(checkpoint, 'git', return_value='codex/wolvesville-ep2-16p-20261031'), contextlib.redirect_stdout(io.StringIO()):
                with patch('sys.argv', ['checkpoint']):
                    checkpoint.main()
                source.unlink()
                with patch('sys.argv', ['checkpoint', '--restore']):
                    checkpoint.main()
                self.assertEqual(source.read_text(), original)
                source.write_text('{"local":"preserve me"}')
                with patch('sys.argv', ['checkpoint', '--restore']):
                    with self.assertRaisesRegex(RuntimeError, 'já existe'):
                        checkpoint.main()
                self.assertEqual(source.read_text(), '{"local":"preserve me"}')
                self.assertEqual(checkpoint.unpack(json.loads(target.read_text()))['files'][str(source.relative_to(root))]['text'], original)


if __name__ == '__main__':
    unittest.main()
