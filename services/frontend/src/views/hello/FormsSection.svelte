<div class="section pl-0 pt-0">
    <h3 id="forms" class="title is-3">Forms</h3>
    <div class="columns">
        <div class="column is-one-quarter">
            <h2 class="title is-4">Vertical</h2>
            <div class="field">
                <label for="t0" class="label">Name</label>
                <div class="control">
                    <input id="t0" class="input" type="text" placeholder="Text input" />
                </div>
            </div>

            <div class="field">
                <label for="t1" class="label">Username</label>
                <div class="control has-icons-left has-icons-right">
                    <input
                        id="t1"
                        class="input is-success"
                        type="text"
                        placeholder="Text input"
                        value="bulma"
                    />
                    <span class="icon is-small is-left">
                        <i class="fa fa-user" />
                    </span>
                    <span class="icon is-small is-right">
                        <i class="fa fa-check" />
                    </span>
                </div>
                <p class="help is-success">This username is available</p>
            </div>

            <div class="field">
                <label for="t2" class="label">Email</label>
                <div class="control has-icons-left has-icons-right">
                    <input
                        id="t2"
                        class="input is-danger"
                        type="email"
                        placeholder="Email input"
                        value="hello@"
                    />
                    <span class="icon is-small is-left">
                        <i class="fa fa-envelope" />
                    </span>
                    <span class="icon is-small is-right">
                        <i class="fa fa-exclamation-triangle" />
                    </span>
                </div>
                <p class="help is-danger">This email is invalid</p>
            </div>

            <div class="field">
                <label for="t3" class="label">Subject</label>
                <div class="control">
                    <div class="select">
                        <select id="t3">
                            <option>Select dropdown</option>
                            <option>With options</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="field">
                <label for="t4" class="label">Message</label>
                <div class="control">
                    <textarea id="t4" class="textarea" placeholder="Textarea" />
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <label for="t5" class="checkbox">
                        <input id="t5" type="checkbox" />
                        I agree to the <a href="#/link">terms and conditions</a>
                    </label>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <label class="radio">
                        <input type="radio" name="question" />
                        Yes
                    </label>
                    <label class="radio">
                        <input type="radio" name="question" />
                        No
                    </label>
                </div>
            </div>

            <div class="field is-grouped">
                <div class="control">
                    <button class="button is-link">Submit</button>
                </div>
                <div class="control">
                    <button class="button is-link is-light">Cancel</button>
                </div>
            </div>
        </div>
        <div class="column">
            <h2 class="title is-4">Horizontal</h2>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label for="t6" class="label">From</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <p class="control is-expanded has-icons-left">
                            <input id="t6" class="input" type="text" placeholder="Name" />
                            <span class="icon is-small is-left">
                                <i class="fa fa-user" />
                            </span>
                        </p>
                    </div>
                    <div class="field">
                        <p class="control is-expanded has-icons-left has-icons-right">
                            <input
                                class="input is-success"
                                type="email"
                                placeholder="Email"
                                value="alex@smith.com"
                            />
                            <span class="icon is-small is-left">
                                <i class="fa fa-envelope" />
                            </span>
                            <span class="icon is-small is-right">
                                <i class="fa fa-check" />
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label" />
                <div class="field-body">
                    <div class="field is-expanded">
                        <div class="field has-addons">
                            <p class="control">
                                <a class="button is-static" href="#/"> +44 </a>
                            </p>
                            <p class="control is-expanded">
                                <input class="input" type="tel" placeholder="Your phone number" />
                            </p>
                        </div>
                        <p class="help">Do not enter the first zero</p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label for="t7" class="label">Department</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select id="t7">
                                    <option>Business development</option>
                                    <option>Marketing</option>
                                    <option>Sales</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label">
                    <label for="t8" class="label">Already a member?</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                        <div class="control" id="t8">
                            <label class="radio">
                                <input type="radio" name="member" />
                                Yes
                            </label>
                            <label class="radio">
                                <input type="radio" name="member" />
                                No
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label for="t9" class="label">Subject</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <input
                                id="t9"
                                class="input is-danger"
                                type="text"
                                placeholder="e.g. Partnership opportunity"
                            />
                        </div>
                        <p class="help is-danger">This field is required</p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label for="t10" class="label">Question</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <textarea
                                id="t10"
                                class="textarea"
                                placeholder="Explain how we can help you"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label">
                    <!-- Left empty for spacing -->
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary"> Send message </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
