$port = if ($args[0]) { $args[0] } else { 8000 }
$env:PORT = $port
node "$PSScriptRoot\tools\serve.mjs"
