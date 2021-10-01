<script>
    export let uid;
</script>

<style>
    span {
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 7px;
        padding-bottom: 8px;
        font-size: 14px;
        line-height: 20px;
        background: #1d81a2;
        opacity: 0.9;
    }
    span:first-child {
        padding-left: 20px;
        border-top-left-radius: 17.5px;
        border-bottom-left-radius: 17.5px;
    }
    span:last-child {
        padding-right: 20px;
        border-top-right-radius: 17.5px;
        border-bottom-right-radius: 17.5px;
    }
</style>

<span data-uid={uid}><slot /></span>
