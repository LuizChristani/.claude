# Memória de correções de código

Registro do que o Claude fez errado no código e de como o usuário pediu para corrigir. Vale para todos os projetos.

## Como usar

- **Antes de escrever código:** leia as entradas abaixo e não repita nenhum desses erros.
- **Quando o usuário corrigir algo no código:** acrescente uma entrada no topo de "Entradas", no mesmo turno, antes de seguir com a tarefa.
- Uma entrada por correção. Se a mesma correção se repetir, não crie outra entrada: atualize a existente e some 1 em "Vezes".
- Toda correção de código também atualiza, no mesmo turno, a skill que cobre o assunto em `skills/` (ex.: `skills/frontend-house-style/CODE-STYLE.md`). A entrada cita o arquivo da skill que mudou.

## Formato

```md
### AAAA-MM-DD · <projeto> · <assunto curto>
- **Errado:** o que o Claude fez (arquivo/trecho, se houver).
- **Correção pedida:** o que o usuário pediu, com as palavras dele quando possível.
- **Regra:** o que fazer daqui em diante, em uma frase.
- **Skill atualizada:** caminho do arquivo da skill que recebeu a regra.
- **Vezes:** 1
```

## Entradas
