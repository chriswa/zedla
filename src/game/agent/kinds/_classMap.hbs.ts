// {{! Files in current directory }}
// {{#each (readdir ".")}}
// {{#if (contains this "AgentKind.ts")}}
// {{#startsWith "_" (basename this)}}
// {{else}}
// import { {{pascalcase (replace (basename this) ".ts" "")}} } from './{{replace this ".ts" ""}}'
// {{/startsWith}}
// {{/if}}
// {{/each}}
// {{! Files in subdirectories }}
// {{#each (readdir "." "isDirectory")}}
// {{#each (readdir this)}}
// {{#if (contains this "AgentKind.ts")}}
// {{#startsWith "_" (basename this)}}
// {{else}}
// import { {{pascalcase (replace (basename this) ".ts" "")}} } from './{{../this}}/{{replace this ".ts" ""}}'
// {{/startsWith}}
// {{/if}}
// {{/each}}
// {{/each}}
//
// export const agentKindClassMap = {
// {{! Files in current directory }}
// {{#each (readdir ".")}}
// {{#if (contains this "AgentKind.ts")}}
// {{#startsWith "_" (basename this)}}
// {{else}}
//   {{pascalcase (replace (basename this) ".ts" "")}},
// {{/startsWith}}
// {{/if}}
// {{/each}}
// {{! Files in subdirectories }}
// {{#each (readdir "." "isDirectory")}}
// {{#each (readdir this)}}
// {{#if (contains this "AgentKind.ts")}}
// {{#startsWith "_" (basename this)}}
// {{else}}
//   {{pascalcase (replace (basename this) ".ts" "")}},
// {{/startsWith}}
// {{/if}}
// {{/each}}
// {{/each}}
// } as const

// ============= GENERATED CODE =============
import { FooAgentKind } from './fooAgentKind'
import { PlayerAgentKind } from './player/playerAgentKind'

export const agentKindClassMap = {
  FooAgentKind,
  PlayerAgentKind,
} as const
