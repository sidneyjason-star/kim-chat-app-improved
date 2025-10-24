# 🚀 Guia de Publicação - Kim Chat App

## Opção 1: Vercel (Recomendado)

Vercel é a plataforma ideal para publicar aplicações Vite com suporte completo a PWA.

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório GitHub com o código do projeto

### Passos

1. **Fazer push do código para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/kim-chat-app.git
   git push -u origin main
   ```

2. **Conectar ao Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Selecione seu repositório GitHub
   - Clique em "Import"

3. **Configurar Variáveis de Ambiente**
   - Na página do projeto no Vercel, vá para "Settings" → "Environment Variables"
   - Adicione as seguintes variáveis:
     ```
     VITE_N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/seu-webhook-id
     VITE_APP_TITLE=Kim - Assistente LLM
     VITE_APP_LOGO=/logo.png
     ```

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde a conclusão (geralmente 2-3 minutos)
   - Seu app estará disponível em `https://seu-projeto.vercel.app`

### Deploy Automático
Após a configuração inicial, qualquer push para a branch `main` fará deploy automático.

---

## Opção 2: Netlify

### Pré-requisitos
- Conta no [Netlify](https://netlify.com)
- Repositório GitHub

### Passos

1. **Conectar ao Netlify**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Selecione GitHub e autorize
   - Escolha seu repositório

2. **Configurar Build**
   - Build command: `pnpm build`
   - Publish directory: `dist/public`

3. **Variáveis de Ambiente**
   - Vá para "Site settings" → "Build & deploy" → "Environment"
   - Adicione as mesmas variáveis do Vercel

4. **Deploy**
   - Clique em "Deploy site"
   - Seu app estará disponível em `https://seu-projeto.netlify.app`

---

## Opção 3: GitHub Pages (Estático)

Ideal se você não precisa de servidor backend.

### Pré-requisitos
- Repositório GitHub público

### Passos

1. **Configurar vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/kim-chat-app/', // Substitua pelo nome do seu repositório
     // ... resto da configuração
   });
   ```

2. **Adicionar GitHub Actions**
   - Crie `.github/workflows/deploy.yml`

3. **Habilitar GitHub Pages**
   - Vá para "Settings" → "Pages"
   - Selecione "Deploy from a branch"
   - Branch: `gh-pages`

---

## Verificação Pós-Deploy

Após publicar, verifique:

- [ ] App carrega corretamente
- [ ] PWA é instalável
- [ ] Webhook do n8n está configurado
- [ ] Mensagens são enviadas e recebidas
- [ ] Gravação de áudio funciona
- [ ] HTTPS está ativado

---

## Troubleshooting

### "Webhook não conecta"
- Verifique se a URL está correta em variáveis de ambiente
- Teste a URL no navegador
- Verifique CORS no seu webhook

### "Variáveis de ambiente não funcionam"
- Certifique-se de que começam com `VITE_`
- Rebuild após adicionar variáveis

### "PWA não instala"
- Verifique se está usando HTTPS
- Verifique se `manifest.json` está correto

---

## Suporte

Para dúvidas sobre deployment:
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Netlify](https://docs.netlify.com)
- [Documentação GitHub Pages](https://docs.github.com/en/pages)

