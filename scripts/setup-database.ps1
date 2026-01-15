# Script de Setup do Banco de Dados
# Este script ajuda a configurar o PostgreSQL para o projeto

Write-Host "🍕 Configuração do Banco de Dados - Sistema de Pizzarias" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está instalado
Write-Host "Verificando se PostgreSQL está instalado..." -ForegroundColor Yellow
$pgPath = Get-Command psql -ErrorAction SilentlyContinue

if ($pgPath) {
    Write-Host "✅ PostgreSQL encontrado!" -ForegroundColor Green
    $pgVersion = & psql --version
    Write-Host "   Versão: $pgVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ PostgreSQL não encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "1. Instalar PostgreSQL localmente" -ForegroundColor Cyan
    Write-Host "2. Usar serviço gerenciado (Neon/Supabase) - RECOMENDADO" -ForegroundColor Cyan
    Write-Host ""
    $choice = Read-Host "Escolha uma opção (1 ou 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "📥 Para instalar PostgreSQL localmente:" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "2. Baixe o instalador (EnterpriseDB)" -ForegroundColor White
        Write-Host "3. Execute o instalador e siga as instruções" -ForegroundColor White
        Write-Host "4. Anote a senha do usuário 'postgres'" -ForegroundColor White
        Write-Host ""
        Write-Host "Após instalar, execute este script novamente." -ForegroundColor Yellow
        
        # Abrir o navegador
        $openBrowser = Read-Host "Deseja abrir a página de download agora? (S/N)"
        if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
            Start-Process "https://www.postgresql.org/download/windows/"
        }
        exit
    } else {
        Write-Host ""
        Write-Host "🌐 Para usar serviço gerenciado (Neon):" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://neon.tech" -ForegroundColor White
        Write-Host "2. Crie uma conta (pode usar GitHub)" -ForegroundColor White
        Write-Host "3. Crie um novo projeto" -ForegroundColor White
        Write-Host "4. Copie a connection string" -ForegroundColor White
        Write-Host "5. Cole no arquivo .env como DATABASE_URL" -ForegroundColor White
        Write-Host ""
        
        $openBrowser = Read-Host "Deseja abrir o Neon agora? (S/N)"
        if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
            Start-Process "https://neon.tech"
        }
        exit
    }
}

# Verificar se o banco existe
Write-Host ""
Write-Host "Verificando banco de dados..." -ForegroundColor Yellow

# Ler .env se existir
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $dbUrl = $envContent | Select-String "DATABASE_URL"
    
    if ($dbUrl) {
        Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
        Write-Host "   DATABASE_URL configurado" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  DATABASE_URL não encontrado no .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
    Write-Host "   Criando arquivo .env de exemplo..." -ForegroundColor Gray
    
    $dbUrl = Read-Host "Digite a connection string do PostgreSQL (ou deixe vazio para usar padrão local)"
    
    if ([string]::IsNullOrWhiteSpace($dbUrl)) {
        $dbPassword = Read-Host "Digite a senha do PostgreSQL (usuário postgres)"
        $dbUrl = "postgresql://postgres:$dbPassword@localhost:5432/pizzaria_db?schema=public"
    }
    
    @"
DATABASE_URL="$dbUrl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_SUBDOMAIN="demo"
"@ | Out-File -FilePath $envFile -Encoding utf8
    
        Write-Host "Arquivo .env criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. pnpm db:migrate  - Criar tabelas no banco" -ForegroundColor White
Write-Host "2. pnpm db:seed     - Popular com dados de exemplo" -ForegroundColor White
Write-Host "3. pnpm dev - Iniciar servidor" -ForegroundColor White

