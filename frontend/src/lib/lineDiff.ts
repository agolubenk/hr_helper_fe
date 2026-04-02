export type DiffOp = 'equal' | 'add' | 'del'

export interface DiffToken {
  op: DiffOp
  text: string
}

function lcsTable(a: string[], b: string[]): number[][] {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp
}

/**
 * Простой line-diff через LCS.
 * Возвращает токены так, чтобы можно было подсветить добавления/удаления.
 *
 * @param fromText "старая" версия (from)
 * @param toText "новая" версия (to)
 */
export function diffLines(fromText: string, toText: string): DiffToken[] {
  const a = fromText.split('\n')
  const b = toText.split('\n')
  const dp = lcsTable(a, b)

  const tokens: DiffToken[] = []
  let i = a.length
  let j = b.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      tokens.push({ op: 'equal', text: a[i - 1]! })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= (dp[i - 1]?.[j] ?? 0))) {
      tokens.push({ op: 'add', text: b[j - 1]! })
      j--
    } else if (i > 0) {
      tokens.push({ op: 'del', text: a[i - 1]! })
      i--
    }
  }

  tokens.reverse()
  return tokens
}

