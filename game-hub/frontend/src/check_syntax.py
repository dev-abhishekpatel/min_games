import sys, os

with open('/home/abhishek/abhishek/p/game-hub/frontend/src/games/GameLibrary.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

stack = []
in_s_quote = False
in_d_quote = False
in_backtick = False
in_comment = False
in_multi_comment = False

i = 0
n = len(code)
line = 1

while i < n:
    ch = code[i]
    if ch == '\n':
        line += 1
        if in_comment:
            in_comment = False

    if in_comment:
        i += 1
        continue

    if in_multi_comment:
        if ch == '*' and i + 1 < n and code[i+1] == '/':
            in_multi_comment = False
            i += 2
            continue
        i += 1
        continue

    if in_s_quote:
        if ch == '\\':
            i += 2
            continue
        if ch == "'":
            in_s_quote = False
        i += 1
        continue

    if in_d_quote:
        if ch == '\\':
            i += 2
            continue
        if ch == '"':
            in_d_quote = False
        i += 1
        continue

    if in_backtick:
        if ch == '\\':
            i += 2
            continue
        if ch == '`':
            in_backtick = False
        i += 1
        continue

    if ch == '/' and i + 1 < n:
        if code[i+1] == '/':
            in_comment = True
            i += 2
            continue
        elif code[i+1] == '*':
            in_multi_comment = True
            i += 2
            continue

    if ch == "'":
        in_s_quote = True
    elif ch == '"':
        in_d_quote = True
    elif ch == '`':
        in_backtick = True
    elif ch == '{':
        stack.append((line, i))
    elif ch == '}':
        if stack:
            stack.pop()
        else:
            print(f"Unmatched closing brace }} at line {line}")

    i += 1

print(f"Unmatched opening braces count: {len(stack)}")
for l, pos in stack:
    snippet = code[max(0, pos-20):min(n, pos+30)].replace('\n', ' ')
    print(f"Unmatched {{ at line {l}: {snippet}")
