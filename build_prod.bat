rmdir /s /q dist
call npx webpack --config build/prod.config.js
ECHO
ECHO 'npm audit:'
call npm audit --parseable
