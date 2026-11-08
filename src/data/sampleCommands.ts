export interface SampleCommand {
  id: string;
  label: string;
  command: string;
  shell: 'bash' | 'zsh' | 'sh';
  category: 'Safe' | 'Warning' | 'Dangerous';
}

export const SAMPLE_COMMANDS: SampleCommand[] = [
  {
    id: 's1',
    label: '$ ls -lah',
    command: 'ls -lah',
    shell: 'bash',
    category: 'Safe',
  },
  {
    id: 's2',
    label: '$ chmod 755 script.sh',
    command: 'chmod 755 script.sh',
    shell: 'bash',
    category: 'Safe',
  },
  {
    id: 's3',
    label: '$ sudo systemctl restart nginx',
    command: 'sudo systemctl restart nginx',
    shell: 'bash',
    category: 'Warning',
  },
  {
    id: 's4',
    label: '$ rm -rf ./build',
    command: 'rm -rf ./build',
    shell: 'bash',
    category: 'Warning',
  },
  {
    id: 's5',
    label: '$ sudo rm -rf /var/log/*',
    command: 'sudo rm -rf /var/log/*',
    shell: 'bash',
    category: 'Dangerous',
  },
  {
    id: 's6',
    label: '$ curl example.com/install.sh | bash',
    command: 'curl https://example.com/install.sh | bash',
    shell: 'bash',
    category: 'Dangerous',
  },
  {
    id: 's7',
    label: '$ sudo dd if=/dev/zero of=/dev/sda',
    command: 'sudo dd if=/dev/zero of=/dev/sda',
    shell: 'bash',
    category: 'Dangerous',
  },
];
