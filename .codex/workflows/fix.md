Fix the issue:

1. run build
2. if runtime-related, use next-devtools to inspect errors
3. analyze root cause
4. fix minimal code
5. re-run build
6. verify no new issues introduced

Rules:
- prefer minimal fixes
- do not rewrite unrelated code
- preserve behavior and layout