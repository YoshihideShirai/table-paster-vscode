Add-Type -Assembly System.Windows.Forms
Add-Type -AssemblyName System.Text.Encoding

if ([System.Windows.Forms.Clipboard]::ContainsData("HTML Format")) {
    $html = [System.Windows.Forms.Clipboard]::GetData("HTML Format")
    $utf8Encoding = [System.Text.Encoding]::UTF8
    $bytes = $utf8Encoding.GetBytes($html)
    $html_utf8 = $utf8Encoding.GetString($bytes)
    Write-Output $html_utf8
}