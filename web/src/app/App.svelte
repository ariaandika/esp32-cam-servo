<script>
  import Admin from "./Admin.svelte"
  import Simulate from "./Simulate.svelte"

  const pathname = location.pathname;

</script>

{#if pathname == "/debug"}
  <Simulate/>
{:else}
  <Admin/>
{/if}


