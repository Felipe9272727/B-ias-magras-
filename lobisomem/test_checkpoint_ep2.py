import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import checkpoint_ep2 as checkpoint


class CheckpointTest(unittest.TestCase):
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
