import { LearnTopic } from '../types';

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'sudo-privileges',
    title: 'Superuser Privileges (sudo)',
    category: 'Privileges',
    badge: 'Core Concept',
    summary: 'Understanding elevated execution risks and root privileges.',
    risks: [
      'Bypasses standard file permission safeguards',
      'Accidental typos can alter core operating system files',
      'Services running as root become high-value attack targets',
    ],
    exampleCommand: 'sudo rm -rf /var/log/*',
    saferExample: 'sudo find /var/log -type f -name "*.log" -delete',
    detailedExplanation:
      '`sudo` (SuperUser DO) allows authorized users to execute commands as the system superuser (root). While necessary for system administration, invoking `sudo` disables OS file protection barriers, turning minor syntax typos into critical system failures.',
  },
  {
    id: 'curl-bash-pipe',
    title: 'Remote Script Piping (curl | bash)',
    category: 'Remote Execution',
    badge: 'Critical Hazard',
    summary: 'Why piping downloaded web content directly into a shell is dangerous.',
    risks: [
      'Executes unverified code straight from a remote web server',
      'Network tampering or compromised CDN delivers malicious payloads',
      'If run with sudo, gives unknown scripts full administrative root access',
    ],
    exampleCommand: 'curl https://example.com/install.sh | bash',
    saferExample: 'curl -sSL https://example.com/install.sh -o install.sh && cat install.sh && bash install.sh',
    detailedExplanation:
      'Piping web requests directly into `bash` or `sh` executes whatever content the web server returns without giving you a chance to audit or inspect the script first. A safer workflow downloads the script to a local file, lets you review the code, and then runs it intentionally.',
  },
  {
    id: 'recursive-deletion',
    title: 'Recursive & Forced Deletion (rm -rf)',
    category: 'Filesystem',
    badge: 'High Impact',
    summary: 'The mechanics of -r (recursive) and -f (force) flags.',
    risks: [
      'Permanent deletion bypassing trash or recovery bins',
      'Forced flag (-f) suppresses confirmation prompts and errors',
      'Unexpected wildcard expansion can erase parent or home directories',
    ],
    exampleCommand: 'rm -rf ./build',
    saferExample: 'rm -i ./build/*',
    detailedExplanation:
      'The `rm` utility removes directory entries permanently. The `-r` flag traverses directory subtrees recursively, while `-f` forces removal without prompting for confirmation. Combining them removes safeguards against unintended directory destruction.',
  },
  {
    id: 'raw-block-devices',
    title: 'Raw Device Operations (dd & mkfs)',
    category: 'Storage',
    badge: 'Critical Hazard',
    summary: 'Interacting directly with /dev/sd* partition blocks.',
    risks: [
      'Direct physical byte-for-byte overwriting',
      'Wipes disk partition tables, bootloaders, and filesystems',
      'No undo or confirmation prompt',
    ],
    exampleCommand: 'sudo dd if=/dev/zero of=/dev/sda',
    saferExample: 'lsblk # Verify drive names before running storage tools',
    detailedExplanation:
      '`dd` and `mkfs` operate directly on block storage devices (e.g. `/dev/sda`, `/dev/nvme0n1`). Mistakes in specifying the `of=` output file path will overwrite drive contents at the byte level without warning.',
  },
  {
    id: 'insecure-permissions',
    title: 'Insecure File Permissions (chmod 777)',
    category: 'Security',
    badge: 'Access Control',
    summary: 'The risks of granting world-writable permissions.',
    risks: [
      'Allows any local process or user account to alter or execute files',
      'Creates security holes for privilege escalation exploits',
      'Reduces compliance and system integrity',
    ],
    exampleCommand: 'chmod -R 777 /var/www/html',
    saferExample: 'chmod -R 755 /var/www/html',
    detailedExplanation:
      'Mode `777` grants read, write, and execute permissions to the Owner, Group, and Public/Others. This leaves files completely unprotected. Standard web root permissions should typically be `755` for directories and `644` for files.',
  },
  {
    id: 'wildcards-globs',
    title: 'Wildcard Expansion Hazards (* and ?)',
    category: 'Shell Syntax',
    badge: 'Syntax Pitfall',
    summary: 'How glob expansion behaves unpredictably near spaces or subpaths.',
    risks: [
      'Unintended spaces like `rm -rf / var/log/*` erase root `/`',
      'Matches unexpected dotfiles or symlinks',
      'Can exceed argument buffer limits',
    ],
    exampleCommand: 'sudo rm -rf / var/log/*',
    saferExample: 'sudo rm -rf /var/log/*',
    detailedExplanation:
      'Shells expand wildcards like `*` before passing arguments to commands. A accidental space between `/` and `var/log` converts the command into deleting root `/` followed by `var/log`. Always double-check spaces in wildcard commands.',
  },
];
