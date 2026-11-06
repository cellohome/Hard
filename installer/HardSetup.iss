; Hard Desktop Application - Inno Setup 6 Script
; Clean, optimize, and understand your Windows PC.
; Target: Windows 10 22H2+ and Windows 11 (x64 and ARM64)

#define MyAppName "Hard"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Hard Independent Software"
#define MyAppURL "https://github.com/hard-app/hard"
#define MyAppExeName "Hard.exe"

[Setup]
AppId={{E58C3B12-68D4-48E0-9E52-6E4ED851AC8D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=..\docs\GPL3_COMPLIANCE.md
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=..\dist-installer
OutputBaseFilename=Hard-Setup-{#MyAppVersion}-x64
SetupIconFile=..\assets\icons\hard.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardSmallImageFile=..\assets\icons\hard-installer-banner.svg
ArchitecturesInstallIn64BitMode=x64compatible or arm64
MinVersion=10.0.19045

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startwithwindows"; Description: "Add Hard Quick Monitor to Windows Startup"; GroupDescription: "Options:"; Flags: unchecked

[Files]
Source: "..\dist\Hard.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\assets\icons\hard-logo.svg"; DestDir: "{app}\assets"; Flags: ignoreversion
Source: "..\docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\Hard Documentation"; Filename: "{app}\docs\ARCHITECTURE.md"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
