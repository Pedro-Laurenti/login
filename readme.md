# Sistema de Login Genérico

Um sistema completo de autenticação com Next.js, PostgreSQL e recursos configuráveis.

## 🚀 Recursos

- ✅ **Autenticação JWT** - Tokens seguros com criptografia
- ✅ **Tokens de acesso automáticos** - Salvos no banco e validados automaticamente  
- ✅ **PostgreSQL** - Banco de dados robusto e seguro
- ✅ **Rate limiting** - Proteção contra ataques de força bruta
- ✅ **Validação segura** - Senhas fortes e validação de email
- ✅ **Registro configurável** - Pode ser habilitado/desabilitado via .env
- ✅ **Recuperação de senha configurável** - Pode ser habilitado/desabilitado via .env
- ✅ **Verificação de email** - Sistema completo de verificação
- ✅ **Sessões múltiplas** - Logout individual ou de todos dispositivos
- ✅ **Interface responsiva** - TailwindCSS + DaisyUI
- ✅ **TypeScript** - Tipagem completa

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd login
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o banco de dados:**
```bash
# Crie o banco de dados PostgreSQL
createdb login_db

# Execute o schema SQL
psql -d login_db -f database/schema.sql
```

4. **Configure as variáveis de ambiente:**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### Variáveis de ambiente obrigatórias:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/login_db

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRES_IN=7d

# Recursos do sistema (true/false)
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY=true

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-nextauth-secret-aqui
```

5. **Execute o projeto:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔧 Configuração

### Habilitando/Desabilitando Recursos

No arquivo `.env`, você pode controlar quais recursos estarão disponíveis:

```env
# Permitir que usuários se cadastrem
NEXT_PUBLIC_ENABLE_REGISTRATION=true

# Permitir recuperação de senha
NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY=true
```

- `NEXT_PUBLIC_ENABLE_REGISTRATION=false` - Remove o link "Criar conta" e desabilita a rota `/api/auth/register`
- `NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY=false` - Remove o link "Esqueceu a senha" e desabilita as rotas de recuperação

## 🗄️ Estrutura do Banco

O sistema cria automaticamente as seguintes tabelas:

- **users** - Informações dos usuários
- **access_tokens** - Tokens de acesso para sessões
- **password_reset_tokens** - Tokens para redefinição de senha  
- **email_verification_tokens** - Tokens para verificação de email

## 🔐 Segurança

### Recursos de Segurança Implementados:

- **Rate Limiting**: Proteção contra ataques de força bruta
- **Senha forte**: Validação de complexidade obrigatória
- **Hashing seguro**: bcryptjs com salt rounds 12
- **Tokens JWT**: Assinados com HS256
- **Cookies HTTP-only**: Tokens não acessíveis via JavaScript
- **CSRF Protection**: Proteção contra ataques cross-site
- **SQL Injection**: Queries parametrizadas
- **Sanitização**: Limpeza de inputs do usuário

### Política de Senhas:

- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula  
- Pelo menos 1 número
- Pelo menos 1 caractere especial

## 📱 Páginas Disponíveis

- `/` - Página inicial (redireciona automaticamente)
- `/login` - Página de login
- `/register` - Página de registro (se habilitado)
- `/forgot-password` - Recuperação de senha (se habilitado)
- `/reset-password` - Redefinição de senha (se habilitado)
- `/dashboard` - Painel do usuário (protegido)
- `/logout` - Logout automático

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/register` - Registrar usuário (se habilitado)
- `POST /api/auth/logout` - Logout
- `DELETE /api/auth/logout` - Logout de todos dispositivos
- `GET /api/auth/validate` - Validar token
- `POST /api/auth/validate` - Validar token específico

### Recuperação de Senha
- `POST /api/auth/forgot-password` - Solicitar redefinição
- `POST /api/auth/reset-password` - Redefinir senha

### Verificação de Email  
- `POST /api/auth/verify-email` - Verificar email
- `PUT /api/auth/verify-email` - Reenviar verificação

## 🚦 Middleware de Autenticação

O sistema possui middleware automático que:

- Redireciona usuários não autenticados de páginas protegidas para `/login`
- Redireciona usuários autenticados de páginas de auth para `/dashboard` 
- Valida tokens automaticamente em cada requisição
- Adiciona informações do usuário nos headers para as páginas

## 💻 Uso no Frontend

### Hook de Autenticação

```typescript
import { useAuth } from '@/lib/authContext';

function MeuComponente() {
  const { 
    user, 
    loading, 
    login, 
    logout, 
    register 
  } = useAuth();

  // Verificar se está autenticado
  if (loading) return <Loading />;
  if (!user) return <LoginForm />;

  // Usuário autenticado
  return <Dashboard user={user} />;
}
```

### Exemplo de Login

```typescript
const { login } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login(email, password);
  
  if (result.success) {
    // Login bem-sucedido - redirecionamento é automático
  } else {
    // Mostrar erro
    setError(result.error);
  }
};
```

## 🔍 Validação de Token

O sistema suporta dois tipos de tokens:

1. **Access Tokens** - Salvos no banco de dados, validados automaticamente
2. **JWT Tokens** - Auto-contidos, verificados criptograficamente

A validação é transparente - o sistema tenta ambos os métodos automaticamente.

## 📧 Sistema de Email (Implementação Futura)

Atualmente, os tokens de verificação e recuperação são impressos no console para desenvolvimento. Em produção, você deve implementar um serviço de email para enviar:

- Links de verificação de email
- Links de redefinição de senha

## 🧪 Teste do Sistema

1. **Inicie o servidor**: `npm run dev`
2. **Acesse**: `http://localhost:3000`
3. **Crie uma conta** (se habilitado)
4. **Faça login**
5. **Teste os recursos** do dashboard

## 🐛 Debug e Logs

O sistema produz logs detalhados para debug:

- Erros de autenticação
- Tentativas de login
- Tokens expirados
- Rate limiting

Verifique o console do servidor para informações de debug.

## 📝 TODO / Melhorias Futuras

- [ ] Integração com serviço de email (SendGrid, Mailgun, etc.)
- [ ] Autenticação OAuth (Google, GitHub, etc.)
- [ ] Captcha em formulários sensíveis
- [ ] Logs de auditoria mais detalhados
- [ ] Dashboard administrativo
- [ ] Testes automatizados
- [ ] Dockerização

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o PostgreSQL está rodando e acessível
3. Confira os logs do servidor para erros específicos
4. Abra uma issue no repositório