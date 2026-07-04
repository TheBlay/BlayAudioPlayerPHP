<h2>Bem-vindo ao Blay Audio Player</h2>
<h3 style="color:blue">A experiência de Audio Offline</h3>
<hr>

<img width="487" height="809" alt="Tela Principal" src="https://github.com/user-attachments/assets/9775d88d-f26b-459b-bcfb-5c168d2a5a78" />
<br/>

## Propósito
  Esse projeto atende a uma necessidade que tenho sentido, após uma má experiência com um player do Youtube que, mesmo com músicas/vídeos baixadas, eles ficam indisponíveis com frequência.
Pensando nisso, aproveitei a oportunidade de não só resolver esse problema, mas também transformar em aprendizado e um projeto palpável

## Princípios de Arquitetura
- Manter o aplicativo <i>browser-first</i> em vez de focado em servidor;
- Disponibilizar a instalação como aplicativo em outros dispositivos, através de <i>Progressive Web Apps</i> (PWA);
- Separar responsabilidades em camadas claras;
- Preferir módulos mais simples do que abstrações Orientadas a Objeto complexas;
- Manter o fluxo principal compreensível para manutenção futura, fazendo a arquitetura mais fácil de evoluir.


## Requisitos Funcionais


## Tecnologias
A aplicação fará uso de recursos comuns que operam com essas funcionalidades, como acesso a sistemas de arquivos, seleção de áudio, incorporação e manipulação do áudio (como tempo e volume ou mais);
após a seleção inicial, os áudios e metadados serão armazenados localmente, sendo disponibilizados para uso sem que seja necessário ler aquela música do sistema de arquivos novamente.
Tecnologias cogitadas até o momento incluem:
- JavaScript;
- Service Workers, fundamental para o funcionamento offline e carregamento rápido;
- Manifest de PWA, definindo a possibilidade de instalar nos dispositivos. Tem configurações próprias de ícone e outros;
- Web Audio API [<a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API">Como usar</a>];
- IndexedDB para armazenamento local de metadados de músicas;
  Dexie.js como biblioteca para melhoria do serviço de IndexedDB;
Uso da função <i>navigator.storage.persist()</i> para tornar persistentes as músicas baixadas.
- File System Access API para acesso aos arquivos locais;
- File Handling API como opção para abrir músicas dos arquivos usando esse aplicativo, sem precisar abrir diretamente pelo aplicativo;

# Planos Futuros
- Usar o PHP futuramente para possibilitar a importação de arquivos da nuvem (via APIs).
- Futuramente, fazer uso da lib yt-dlp para download de músicas [ref.: https://github.com/yt-dlp/yt-dlp#general-options];

# Design
Cor de Accent: #9177f6 -> Roxo;
