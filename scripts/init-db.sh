#!/bin/bash

# Script para inicializar o banco de dados do sistema de login

echo "🗄️  Inicializando banco de dados do sistema de login..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado. Instale o PostgreSQL primeiro."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis antes de continuar."
    echo "📝 Edite o arquivo .env com suas configurações de banco de dados."
    exit 1
fi

# Carregar variáveis do .env
source .env

# Extrair informações da DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não configurada no .env"
    exit 1
fi

# Extrair componentes da URL do banco
# Formato: postgresql://username:password@host:port/database
DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"

if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Formato de DATABASE_URL inválido"
    echo "Expected: postgresql://username:password@host:port/database"
    exit 1
fi

echo "📊 Configurações do banco:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Verificar conexão com PostgreSQL
echo "🔌 Testando conexão com PostgreSQL..."
export PGPASSWORD="$DB_PASSWORD"

if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "\q" 2>/dev/null; then
    echo "❌ Não foi possível conectar ao PostgreSQL"
    echo "Verifique se:"
    echo "  - PostgreSQL está rodando"
    echo "  - As credenciais no .env estão corretas"
    echo "  - O usuário tem permissões adequadas"
    exit 1
fi

echo "✅ Conexão estabelecida com sucesso!"

# Verificar se o banco de dados existe
echo "🔍 Verificando se o banco '$DB_NAME' existe..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Banco de dados '$DB_NAME' já existe"
else
    echo "📦 Criando banco de dados '$DB_NAME'..."
    if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"; then
        echo "✅ Banco de dados '$DB_NAME' criado com sucesso!"
    else
        echo "❌ Erro ao criar banco de dados"
        exit 1
    fi
fi

# Executar schema SQL
echo "🏗️  Executando schema do banco de dados..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql; then
    echo "✅ Schema aplicado com sucesso!"
else
    echo "❌ Erro ao aplicar schema"
    exit 1
fi

# Verificar se as tabelas foram criadas
echo "🔍 Verificando tabelas criadas..."
TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" | tr -d ' ')

EXPECTED_TABLES=("users" "access_tokens" "password_reset_tokens" "email_verification_tokens")
ALL_TABLES_FOUND=true

for table in "${EXPECTED_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "^$table$"; then
        echo "  ✅ Tabela '$table' encontrada"
    else
        echo "  ❌ Tabela '$table' não encontrada"
        ALL_TABLES_FOUND=false
    fi
done

if [ "$ALL_TABLES_FOUND" = true ]; then
    echo ""
    echo "🎉 Banco de dados inicializado com sucesso!"
    echo ""
    echo "🚀 Próximos passos:"
    echo "  1. Verifique as configurações no arquivo .env"
    echo "  2. Execute: npm run dev"
    echo "  3. Acesse: http://localhost:3000"
    echo ""
    echo "📝 Recursos configuráveis no .env:"
    echo "  - NEXT_PUBLIC_ENABLE_REGISTRATION (true/false)"
    echo "  - NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY (true/false)"
else
    echo "❌ Algumas tabelas não foram criadas corretamente"
    exit 1
fi
