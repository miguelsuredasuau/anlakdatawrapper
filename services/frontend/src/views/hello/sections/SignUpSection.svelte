<script>
    import SignUp from '../signin/SignUpForm.svelte';

    export let __;
</script>

<div class="section pl-0 pt-0">
    <h3 id="signup" class="title is-3">Sign Up dialogue</h3>
    <div class="columns">
        <div class="column is-5 box p-5">
            <SignUp
                {__}
                providers={[
                    {
                        label: 'Twitter',
                        url: '/signin/twitter',
                        icon: 'twitter'
                    }
                ]}
            />
        </div>
    </div>
</div>
