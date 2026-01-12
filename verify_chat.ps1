
$BaseUrl = "http://localhost:8000/api"

# 1. Signup/Signin
Write-Host "1. Authenticating..."
$Email = "test_chat2@example.com"
$Password = "password123"

# Signup
try {
    $SignupBody = @{
        email = $Email
        password = $Password
        fullName = "Test User"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BaseUrl/auth/signup" -Method Post -Body $SignupBody -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "Status: Signup attempt complete"
} catch {
    Write-Host "Status: Signup error (might already exist)"
}

# Signin
try {
    $SigninBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $SigninResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/signin" -Method Post -Body $SigninBody -ContentType "application/json"
    $Token = $SigninResponse.access_token
    Write-Host "Status: Authenticated successfully"
} catch {
    Write-Host "Authentication failed"
    exit 1
}

# 2. Send chat message
Write-Host "`n2. Sending chat message: 'Add buy milk to my list'..."
$Headers = @{
    Authorization = "Bearer $Token"
}

$ChatBody = @{
    message = "Add buy milk to my list"
} | ConvertTo-Json

try {
    $ChatResponse = Invoke-RestMethod -Uri "$BaseUrl/chat" -Method Post -Body $ChatBody -Headers $Headers -ContentType "application/json"
    Write-Host "Status: Chat request successful"
    $ChatResponse | ConvertTo-Json
} catch {
    Write-Host "Status: Chat request failed"
    exit 1
}

# 3. Verify todo was created
Write-Host "`n3. Verifying todo creation..."
try {
    $Todos = Invoke-RestMethod -Uri "$BaseUrl/todos" -Method Get -Headers $Headers

    $Found = $false
    foreach ($Todo in $Todos) {
        if ($Todo.title -match "buy milk") {
            $Found = $true
            Write-Host "Found todo: $($Todo | ConvertTo-Json)"
            break
        }
    }

    if ($Found) {
        Write-Host "`nSUCCESS: Chat created the todo item correctly!"
    } else {
        Write-Host "`nFAILURE: Todo item not found in list"
    }
} catch {
    Write-Host "Error verifying todos"
    exit 1
}
