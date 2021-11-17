<script>
    export let visualizations;
</script>

<div class="section pl-0 pt-0">
    <h3 id="table" class="title is-3">Table</h3>

    <table class="table is-striped">
        <thead>
            <tr>
                <th>#</th>
                <th>Id</th>
                <th>Name</th>
                <th>Plugin</th>
                <th>Workflow</th>
            </tr>
        </thead>
        <tbody>
            {#each visualizations as vis, i}
                <tr>
                    <td><tt class="has-text-grey">{i + 1}</tt></td>
                    <td>{vis.id}</td>
                    <td>{vis.title}</td>
                    <td><span class="tag">{vis.__plugin}</span></td>
                    <td
                        ><span
                            class="tag"
                            class:is-primary={vis.namespace === 'chart'}
                            class:is-black={vis.namespace === 'map'}
                            class:is-success={vis.namespace === 'table'}>{vis.namespace}</span
                        ></td
                    >
                </tr>
            {/each}
        </tbody>
    </table>
</div>
