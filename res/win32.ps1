# Adapted from https://github.com/octan3/img-clipboard-dump/blob/master/dump-clipboard-png.ps1
Add-Type -Assembly System.Windows.Forms
Add-Type -Assembly PresentationCore

Get-Clipboard -Format Text -TextFormatType Html