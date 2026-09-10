!macro NSIS_HOOK_POSTINSTALL
  ; Register Capabilities for Default Apps
  WriteRegStr HKCU "Software\Scribe\Capabilities" "ApplicationName" "Scribe"
  WriteRegStr HKCU "Software\Scribe\Capabilities" "ApplicationDescription" "A fast, native Markdown editor and viewer."
  WriteRegStr HKCU "Software\Scribe\Capabilities\FileAssociations" ".md" "Scribe.md"
  WriteRegStr HKCU "Software\Scribe\Capabilities\FileAssociations" ".markdown" "Scribe.md"
  WriteRegStr HKCU "Software\Scribe\Capabilities\FileAssociations" ".mdown" "Scribe.md"
  WriteRegStr HKCU "Software\Scribe\Capabilities\FileAssociations" ".mkd" "Scribe.md"

  WriteRegStr HKCU "Software\RegisteredApplications" "Scribe" "Software\Scribe\Capabilities"

  ; Register ProgID
  WriteRegStr HKCU "Software\Classes\Scribe.md" "" "Markdown Document"
  WriteRegStr HKCU "Software\Classes\Scribe.md" "FriendlyTypeName" "Markdown Document"
  WriteRegStr HKCU "Software\Classes\Scribe.md\DefaultIcon" "" '"$INSTDIR\scribe.exe",0'
  WriteRegStr HKCU "Software\Classes\Scribe.md\shell\open\command" "" '"$INSTDIR\scribe.exe" "%1"'

  ; Register OpenWithProgids
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "Scribe.md" ""
  WriteRegStr HKCU "Software\Classes\.markdown\OpenWithProgids" "Scribe.md" ""
  WriteRegStr HKCU "Software\Classes\.mdown\OpenWithProgids" "Scribe.md" ""
  WriteRegStr HKCU "Software\Classes\.mkd\OpenWithProgids" "Scribe.md" ""

  ; Register Applications\scribe.exe
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe" "FriendlyAppName" "Scribe"
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe\shell\open\command" "" '"$INSTDIR\scribe.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe\SupportedTypes" ".md" ""
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe\SupportedTypes" ".markdown" ""
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe\SupportedTypes" ".mdown" ""
  WriteRegStr HKCU "Software\Classes\Applications\scribe.exe\SupportedTypes" ".mkd" ""

  ; Refresh shell
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DeleteRegKey HKCU "Software\Scribe"
  DeleteRegValue HKCU "Software\RegisteredApplications" "Scribe"
  DeleteRegKey HKCU "Software\Classes\Scribe.md"
  DeleteRegValue HKCU "Software\Classes\.md\OpenWithProgids" "Scribe.md"
  DeleteRegValue HKCU "Software\Classes\.markdown\OpenWithProgids" "Scribe.md"
  DeleteRegValue HKCU "Software\Classes\.mdown\OpenWithProgids" "Scribe.md"
  DeleteRegValue HKCU "Software\Classes\.mkd\OpenWithProgids" "Scribe.md"
  DeleteRegKey HKCU "Software\Classes\Applications\scribe.exe"

  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
