<!--
  Simple SvelteFlow test - following official docs
-->
<script>
  import { SvelteFlow, Controls, Background } from '@xyflow/svelte';

  // Basic example from SvelteFlow docs
  let nodes = [
    {
      id: '1',
      type: 'default',
      data: { label: 'Hello' },
      position: { x: 250, y: 5 }
    },
    {
      id: '2',
      type: 'default',
      data: { label: 'World' },
      position: { x: 100, y: 100 }
    }
  ];

  let edges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2'
    }
  ];
</script>

<div style="height: 100vh;">
  <SvelteFlow {nodes} {edges}>
    <Controls />
    <Background />
  </SvelteFlow>
</div>
