<script>
  import Admin from "./Admin.svelte"
  import Debug from "./Debug.svelte";

  const pathname = location.pathname;

</script>

{#if pathname == "/debug"}
  <Debug/>
{:else}
  <Admin/>
{/if}


