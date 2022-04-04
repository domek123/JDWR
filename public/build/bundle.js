
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Tailwindcss.svelte generated by Svelte v3.46.4 */

    function create_fragment$a(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tailwindcss', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.46.4 */

    const file$8 = "src\\components\\Header.svelte";

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let div1;
    	let a4;
    	let t9;
    	let a5;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Strona główna";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Galeria";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Article";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Komentarze";
    			t7 = space();
    			div1 = element("div");
    			a4 = element("a");
    			a4.textContent = "Login";
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Register";
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-llcyc9");
    			add_location(a0, file$8, 2, 8, 82);
    			attr_dev(a1, "href", "/gallery");
    			attr_dev(a1, "class", "svelte-llcyc9");
    			add_location(a1, file$8, 3, 8, 121);
    			attr_dev(a2, "href", "/article");
    			attr_dev(a2, "class", "svelte-llcyc9");
    			add_location(a2, file$8, 4, 8, 161);
    			attr_dev(a3, "href", "/comments");
    			attr_dev(a3, "class", "svelte-llcyc9");
    			add_location(a3, file$8, 5, 8, 201);
    			attr_dev(div0, "class", "page-links svelte-llcyc9");
    			add_location(div0, file$8, 1, 4, 48);
    			attr_dev(a4, "href", "/login");
    			attr_dev(a4, "class", "svelte-llcyc9");
    			add_location(a4, file$8, 8, 8, 286);
    			attr_dev(a5, "href", "/register");
    			attr_dev(a5, "class", "svelte-llcyc9");
    			add_location(a5, file$8, 9, 8, 322);
    			attr_dev(div1, "class", "cms-links svelte-llcyc9");
    			add_location(div1, file$8, 7, 4, 253);
    			attr_dev(div2, "class", "header-container bg-gray-900 svelte-llcyc9");
    			add_location(div2, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(div0, t3);
    			append_dev(div0, a2);
    			append_dev(div0, t5);
    			append_dev(div0, a3);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a4);
    			append_dev(div1, t9);
    			append_dev(div1, a5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Slider.svelte generated by Svelte v3.46.4 */

    const file$7 = "src\\components\\Slider.svelte";

    function create_fragment$7(ctx) {
    	let div7;
    	let div6;
    	let input0;
    	let t0;
    	let div1;
    	let div0;
    	let t2;
    	let label0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div3;
    	let div2;
    	let t9;
    	let label2;
    	let t11;
    	let label3;
    	let t13;
    	let input2;
    	let t14;
    	let div5;
    	let div4;
    	let t16;
    	let label4;
    	let t18;
    	let label5;
    	let t20;
    	let ol;
    	let li0;
    	let label6;
    	let t22;
    	let li1;
    	let label7;
    	let t24;
    	let li2;
    	let label8;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			input0 = element("input");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Slide 1";
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "‹";
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "›";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Slide 2";
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "‹";
    			t11 = space();
    			label3 = element("label");
    			label3.textContent = "›";
    			t13 = space();
    			input2 = element("input");
    			t14 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Slide 3";
    			t16 = space();
    			label4 = element("label");
    			label4.textContent = "‹";
    			t18 = space();
    			label5 = element("label");
    			label5.textContent = "›";
    			t20 = space();
    			ol = element("ol");
    			li0 = element("li");
    			label6 = element("label");
    			label6.textContent = "•";
    			t22 = space();
    			li1 = element("li");
    			label7 = element("label");
    			label7.textContent = "•";
    			t24 = space();
    			li2 = element("li");
    			label8 = element("label");
    			label8.textContent = "•";
    			attr_dev(input0, "class", "carousel-open svelte-rdtaqq");
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "carousel-1");
    			attr_dev(input0, "name", "carousel");
    			attr_dev(input0, "aria-hidden", "true");
    			input0.hidden = "";
    			input0.checked = "checked";
    			add_location(input0, file$7, 3, 8, 151);
    			attr_dev(div0, "class", "block h-full w-full bg-indigo-500 text-white text-5xl text-center");
    			add_location(div0, file$7, 13, 12, 465);
    			attr_dev(div1, "class", "carousel-item absolute opacity-0 svelte-rdtaqq");
    			set_style(div1, "height", "50vh");
    			add_location(div1, file$7, 12, 8, 384);
    			attr_dev(label0, "for", "carousel-3");
    			attr_dev(label0, "class", "prev control-1 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 left-0 my-auto svelte-rdtaqq");
    			add_location(label0, file$7, 19, 8, 646);
    			attr_dev(label1, "for", "carousel-2");
    			attr_dev(label1, "class", "next control-1 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 right-0 my-auto svelte-rdtaqq");
    			add_location(label1, file$7, 24, 8, 960);
    			attr_dev(input1, "class", "carousel-open svelte-rdtaqq");
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "carousel-2");
    			attr_dev(input1, "name", "carousel");
    			attr_dev(input1, "aria-hidden", "true");
    			input1.hidden = "";
    			add_location(input1, file$7, 31, 8, 1301);
    			attr_dev(div2, "class", "block h-full w-full bg-orange-500 text-white text-5xl text-center");
    			add_location(div2, file$7, 40, 12, 1584);
    			attr_dev(div3, "class", "carousel-item absolute opacity-0 svelte-rdtaqq");
    			set_style(div3, "height", "50vh");
    			add_location(div3, file$7, 39, 8, 1503);
    			attr_dev(label2, "for", "carousel-1");
    			attr_dev(label2, "class", "prev control-2 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 left-0 my-auto svelte-rdtaqq");
    			add_location(label2, file$7, 46, 8, 1765);
    			attr_dev(label3, "for", "carousel-3");
    			attr_dev(label3, "class", "next control-2 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 right-0 my-auto svelte-rdtaqq");
    			add_location(label3, file$7, 51, 8, 2079);
    			attr_dev(input2, "class", "carousel-open svelte-rdtaqq");
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "carousel-3");
    			attr_dev(input2, "name", "carousel");
    			attr_dev(input2, "aria-hidden", "true");
    			input2.hidden = "";
    			add_location(input2, file$7, 58, 8, 2420);
    			attr_dev(div4, "class", "block h-full w-full bg-green-500 text-white text-5xl text-center");
    			add_location(div4, file$7, 67, 12, 2703);
    			attr_dev(div5, "class", "carousel-item absolute opacity-0 svelte-rdtaqq");
    			set_style(div5, "height", "50vh");
    			add_location(div5, file$7, 66, 8, 2622);
    			attr_dev(label4, "for", "carousel-2");
    			attr_dev(label4, "class", "prev control-3 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 left-0 my-auto svelte-rdtaqq");
    			add_location(label4, file$7, 73, 8, 2883);
    			attr_dev(label5, "for", "carousel-1");
    			attr_dev(label5, "class", "next control-3 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full bg-white hover:bg-blue-700 leading-tight text-center z-10 inset-y-0 right-0 my-auto svelte-rdtaqq");
    			add_location(label5, file$7, 78, 8, 3197);
    			attr_dev(label6, "for", "carousel-1");
    			attr_dev(label6, "class", "carousel-bullet cursor-pointer block text-4xl text-white hover:text-blue-700 svelte-rdtaqq");
    			add_location(label6, file$7, 87, 16, 3666);
    			attr_dev(li0, "class", "inline-block mr-3");
    			add_location(li0, file$7, 86, 12, 3618);
    			attr_dev(label7, "for", "carousel-2");
    			attr_dev(label7, "class", "carousel-bullet cursor-pointer block text-4xl text-white hover:text-blue-700 svelte-rdtaqq");
    			add_location(label7, file$7, 94, 16, 3947);
    			attr_dev(li1, "class", "inline-block mr-3");
    			add_location(li1, file$7, 93, 12, 3899);
    			attr_dev(label8, "for", "carousel-3");
    			attr_dev(label8, "class", "carousel-bullet cursor-pointer block text-4xl text-white hover:text-blue-700 svelte-rdtaqq");
    			add_location(label8, file$7, 101, 16, 4228);
    			attr_dev(li2, "class", "inline-block mr-3");
    			add_location(li2, file$7, 100, 12, 4180);
    			attr_dev(ol, "class", "carousel-indicators svelte-rdtaqq");
    			add_location(ol, file$7, 85, 8, 3572);
    			attr_dev(div6, "class", "carousel-inner relative overflow-hidden w-full");
    			add_location(div6, file$7, 1, 4, 57);
    			attr_dev(div7, "class", "carousel relative shadow-2xl bg-white");
    			add_location(div7, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, input0);
    			append_dev(div6, t0);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div6, t2);
    			append_dev(div6, label0);
    			append_dev(div6, t4);
    			append_dev(div6, label1);
    			append_dev(div6, t6);
    			append_dev(div6, input1);
    			append_dev(div6, t7);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div6, t9);
    			append_dev(div6, label2);
    			append_dev(div6, t11);
    			append_dev(div6, label3);
    			append_dev(div6, t13);
    			append_dev(div6, input2);
    			append_dev(div6, t14);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div6, t16);
    			append_dev(div6, label4);
    			append_dev(div6, t18);
    			append_dev(div6, label5);
    			append_dev(div6, t20);
    			append_dev(div6, ol);
    			append_dev(ol, li0);
    			append_dev(li0, label6);
    			append_dev(ol, t22);
    			append_dev(ol, li1);
    			append_dev(li1, label7);
    			append_dev(ol, t24);
    			append_dev(ol, li2);
    			append_dev(li2, label8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.46.4 */

    const file$6 = "src\\components\\Footer.svelte";

    function create_fragment$6(ctx) {
    	let footer;
    	let div1;
    	let div0;
    	let a0;
    	let svg0;
    	let path0;
    	let t0;
    	let a1;
    	let svg1;
    	let path1;
    	let t1;
    	let a2;
    	let svg2;
    	let path2;
    	let t2;
    	let a3;
    	let svg3;
    	let path3;
    	let t3;
    	let a4;
    	let svg4;
    	let path4;
    	let t4;
    	let a5;
    	let svg5;
    	let path5;
    	let t5;
    	let div2;
    	let t6;
    	let a6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t2 = space();
    			a3 = element("a");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t3 = space();
    			a4 = element("a");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t4 = space();
    			a5 = element("a");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t5 = space();
    			div2 = element("div");
    			t6 = text("© 2021 Copyright:\r\n        ");
    			a6 = element("a");
    			a6.textContent = "Dominik & Jakub";
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z");
    			add_location(path0, file$6, 18, 20, 814);
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "focusable", "false");
    			attr_dev(svg0, "data-prefix", "fab");
    			attr_dev(svg0, "data-icon", "facebook-f");
    			attr_dev(svg0, "class", "w-2 h-full mx-auto");
    			attr_dev(svg0, "role", "img");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 320 512");
    			add_location(svg0, file$6, 8, 16, 428);
    			attr_dev(a0, "href", "#!");
    			attr_dev(a0, "type", "button");
    			attr_dev(a0, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a0, file$6, 3, 12, 125);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z");
    			add_location(path1, file$6, 40, 20, 1834);
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "focusable", "false");
    			attr_dev(svg1, "data-prefix", "fab");
    			attr_dev(svg1, "data-icon", "twitter");
    			attr_dev(svg1, "class", "w-3 h-full mx-auto");
    			attr_dev(svg1, "role", "img");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			add_location(svg1, file$6, 30, 16, 1451);
    			attr_dev(a1, "href", "#!");
    			attr_dev(a1, "type", "button");
    			attr_dev(a1, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a1, file$6, 25, 12, 1148);
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "d", "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z");
    			add_location(path2, file$6, 62, 20, 3472);
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "focusable", "false");
    			attr_dev(svg2, "data-prefix", "fab");
    			attr_dev(svg2, "data-icon", "google");
    			attr_dev(svg2, "class", "w-3 h-full mx-auto");
    			attr_dev(svg2, "role", "img");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 488 512");
    			add_location(svg2, file$6, 52, 16, 3090);
    			attr_dev(a2, "href", "#!");
    			attr_dev(a2, "type", "button");
    			attr_dev(a2, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a2, file$6, 47, 12, 2787);
    			attr_dev(path3, "fill", "currentColor");
    			attr_dev(path3, "d", "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z");
    			add_location(path3, file$6, 84, 20, 4569);
    			attr_dev(svg3, "aria-hidden", "true");
    			attr_dev(svg3, "focusable", "false");
    			attr_dev(svg3, "data-prefix", "fab");
    			attr_dev(svg3, "data-icon", "instagram");
    			attr_dev(svg3, "class", "w-3 h-full mx-auto");
    			attr_dev(svg3, "role", "img");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "viewBox", "0 0 448 512");
    			add_location(svg3, file$6, 74, 16, 4184);
    			attr_dev(a3, "href", "#!");
    			attr_dev(a3, "type", "button");
    			attr_dev(a3, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a3, file$6, 69, 12, 3881);
    			attr_dev(path4, "fill", "currentColor");
    			attr_dev(path4, "d", "M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z");
    			add_location(path4, file$6, 106, 20, 6343);
    			attr_dev(svg4, "aria-hidden", "true");
    			attr_dev(svg4, "focusable", "false");
    			attr_dev(svg4, "data-prefix", "fab");
    			attr_dev(svg4, "data-icon", "linkedin-in");
    			attr_dev(svg4, "class", "w-3 h-full mx-auto");
    			attr_dev(svg4, "role", "img");
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "viewBox", "0 0 448 512");
    			add_location(svg4, file$6, 96, 16, 5956);
    			attr_dev(a4, "href", "#!");
    			attr_dev(a4, "type", "button");
    			attr_dev(a4, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a4, file$6, 91, 12, 5653);
    			attr_dev(path5, "fill", "currentColor");
    			attr_dev(path5, "d", "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z");
    			add_location(path5, file$6, 128, 20, 7490);
    			attr_dev(svg5, "aria-hidden", "true");
    			attr_dev(svg5, "focusable", "false");
    			attr_dev(svg5, "data-prefix", "fab");
    			attr_dev(svg5, "data-icon", "github");
    			attr_dev(svg5, "class", "w-3 h-full mx-auto");
    			attr_dev(svg5, "role", "img");
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "viewBox", "0 0 496 512");
    			add_location(svg5, file$6, 118, 16, 7108);
    			attr_dev(a5, "href", "#!");
    			attr_dev(a5, "type", "button");
    			attr_dev(a5, "class", "rounded-full border-2 border-white text-white leading-normal uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-9 h-9 m-1 svelte-q83f30");
    			add_location(a5, file$6, 113, 12, 6805);
    			attr_dev(div0, "class", "footer-main svelte-q83f30");
    			add_location(div0, file$6, 2, 8, 86);
    			attr_dev(div1, "class", "px-6");
    			add_location(div1, file$6, 1, 4, 57);
    			attr_dev(a6, "class", "text-whitehite");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$6, 139, 8, 9088);
    			attr_dev(div2, "class", "text-center p-4");
    			set_style(div2, "background-color", "rgba(0, 0, 0, 0.2)");
    			add_location(div2, file$6, 137, 4, 8976);
    			attr_dev(footer, "class", "text-center bg-gray-900 text-white");
    			add_location(footer, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div0, t1);
    			append_dev(div0, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    			append_dev(div0, t2);
    			append_dev(div0, a3);
    			append_dev(a3, svg3);
    			append_dev(svg3, path3);
    			append_dev(div0, t3);
    			append_dev(div0, a4);
    			append_dev(a4, svg4);
    			append_dev(svg4, path4);
    			append_dev(div0, t4);
    			append_dev(div0, a5);
    			append_dev(a5, svg5);
    			append_dev(svg5, path5);
    			append_dev(footer, t5);
    			append_dev(footer, div2);
    			append_dev(div2, t6);
    			append_dev(div2, a6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\routes\Contact.svelte generated by Svelte v3.46.4 */

    const file$5 = "src\\routes\\Contact.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div8;
    	let div3;
    	let iframe;
    	let iframe_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let h20;
    	let t2;
    	let p0;
    	let t4;
    	let div1;
    	let h21;
    	let t6;
    	let a;
    	let t8;
    	let h22;
    	let t10;
    	let p1;
    	let t12;
    	let div7;
    	let h23;
    	let t14;
    	let p2;
    	let t16;
    	let div4;
    	let label0;
    	let t18;
    	let input0;
    	let t19;
    	let div5;
    	let label1;
    	let t21;
    	let input1;
    	let t22;
    	let div6;
    	let label2;
    	let t24;
    	let textarea;
    	let t25;
    	let button;
    	let t27;
    	let p3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div8 = element("div");
    			div3 = element("div");
    			iframe = element("iframe");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "ADDRESS";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Photo booth tattooed prism, portland taiyaki hoodie neutra\n            typewriter";
    			t4 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "EMAIL";
    			t6 = space();
    			a = element("a");
    			a.textContent = "example@email.com";
    			t8 = space();
    			h22 = element("h2");
    			h22.textContent = "PHONE";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "123-456-7890";
    			t12 = space();
    			div7 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Feedback";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Post-ironic portland shabby chic echo park, banjo fashion axe";
    			t16 = space();
    			div4 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t18 = space();
    			input0 = element("input");
    			t19 = space();
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t21 = space();
    			input1 = element("input");
    			t22 = space();
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Message";
    			t24 = space();
    			textarea = element("textarea");
    			t25 = space();
    			button = element("button");
    			button.textContent = "Button";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "Chicharrones blog helvetica normcore iceland tousled brook viral\n        artisan.";
    			attr_dev(iframe, "class", "absolute inset-0");
    			set_style(iframe, "filter", "grayscale(1) contrast(1.2) opacity(0.4)");
    			attr_dev(iframe, "title", "map");
    			attr_dev(iframe, "marginheight", "0");
    			attr_dev(iframe, "marginwidth", "0");
    			attr_dev(iframe, "scrolling", "no");
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://maps.google.com/maps?width=100%&height=600&hl=en&q=%C4%B0zmir+(My%20Business%20Name)&ie=UTF8&t=&z=14&iwloc=B&output=embed")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "100%");
    			attr_dev(iframe, "frameborder", "0");
    			add_location(iframe, file$5, 5, 6, 270);
    			attr_dev(h20, "class", "title-font font-semibold text-gray-900 tracking-widest text-xs");
    			add_location(h20, file$5, 19, 10, 810);
    			attr_dev(p0, "class", "mt-1");
    			add_location(p0, file$5, 24, 10, 955);
    			attr_dev(div0, "class", "lg:w-1/2 px-6");
    			add_location(div0, file$5, 18, 8, 772);
    			attr_dev(h21, "class", "title-font font-semibold text-gray-900 tracking-widest text-xs");
    			add_location(h21, file$5, 30, 10, 1155);
    			attr_dev(a, "class", "text-indigo-500 leading-relaxed");
    			add_location(a, file$5, 35, 10, 1298);
    			attr_dev(h22, "class", "title-font font-semibold text-gray-900 tracking-widest text-xs mt-4");
    			add_location(h22, file$5, 36, 10, 1373);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$5, 41, 10, 1521);
    			attr_dev(div1, "class", "lg:w-1/2 px-6 mt-4 lg:mt-0");
    			add_location(div1, file$5, 29, 8, 1104);
    			attr_dev(div2, "class", "bg-white relative flex flex-wrap py-6 rounded shadow-md");
    			add_location(div2, file$5, 17, 6, 694);
    			attr_dev(div3, "class", "lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative");
    			add_location(div3, file$5, 2, 4, 130);
    			attr_dev(h23, "class", "text-gray-900 text-lg mb-1 font-medium title-font");
    			add_location(h23, file$5, 48, 6, 1719);
    			attr_dev(p2, "class", "leading-relaxed mb-5 text-gray-600");
    			add_location(p2, file$5, 51, 6, 1817);
    			attr_dev(label0, "for", "name");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$5, 55, 8, 1987);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$5, 56, 8, 2066);
    			attr_dev(div4, "class", "relative mb-4");
    			add_location(div4, file$5, 54, 6, 1951);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$5, 64, 8, 2427);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$5, 65, 8, 2508);
    			attr_dev(div5, "class", "relative mb-4");
    			add_location(div5, file$5, 63, 6, 2391);
    			attr_dev(label2, "for", "message");
    			attr_dev(label2, "class", "leading-7 text-sm text-gray-600");
    			add_location(label2, file$5, 73, 8, 2872);
    			attr_dev(textarea, "id", "message");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "class", "w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out");
    			add_location(textarea, file$5, 76, 8, 2977);
    			attr_dev(div6, "class", "relative mb-4");
    			add_location(div6, file$5, 72, 6, 2836);
    			attr_dev(button, "class", "text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg");
    			add_location(button, file$5, 82, 6, 3306);
    			attr_dev(p3, "class", "text-xs text-gray-500 mt-3");
    			add_location(p3, file$5, 86, 6, 3467);
    			attr_dev(div7, "class", "lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0");
    			add_location(div7, file$5, 45, 4, 1608);
    			attr_dev(div8, "class", "container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap");
    			add_location(div8, file$5, 1, 2, 53);
    			attr_dev(section, "class", "text-gray-600 body-font relative");
    			add_location(section, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div8);
    			append_dev(div8, div3);
    			append_dev(div3, iframe);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t6);
    			append_dev(div1, a);
    			append_dev(div1, t8);
    			append_dev(div1, h22);
    			append_dev(div1, t10);
    			append_dev(div1, p1);
    			append_dev(div8, t12);
    			append_dev(div8, div7);
    			append_dev(div7, h23);
    			append_dev(div7, t14);
    			append_dev(div7, p2);
    			append_dev(div7, t16);
    			append_dev(div7, div4);
    			append_dev(div4, label0);
    			append_dev(div4, t18);
    			append_dev(div4, input0);
    			append_dev(div7, t19);
    			append_dev(div7, div5);
    			append_dev(div5, label1);
    			append_dev(div5, t21);
    			append_dev(div5, input1);
    			append_dev(div7, t22);
    			append_dev(div7, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t24);
    			append_dev(div6, textarea);
    			append_dev(div7, t25);
    			append_dev(div7, button);
    			append_dev(div7, t27);
    			append_dev(div7, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\News.svelte generated by Svelte v3.46.4 */

    const file$4 = "src\\components\\News.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1_value = /*info*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*info*/ ctx[0].text + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(img, "class", "lg:h-60 xl:h-56 md:h-64 sm:h-72 xs:h-72 h-72 rounded w-full object-cover object-center mb-6");
    			if (!src_url_equal(img.src, img_src_value = /*info*/ ctx[0].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Image Size 720x400");
    			add_location(img, file$4, 6, 8, 158);
    			attr_dev(h2, "class", "text-lg text-gray-900 font-medium title-font mb-4");
    			add_location(h2, file$4, 11, 8, 364);
    			attr_dev(p, "class", "leading-relaxed text-base");
    			add_location(p, file$4, 14, 8, 477);
    			attr_dev(div0, "class", "bg-white p-6 rounded-lg border-gray-100 border-2");
    			add_location(div0, file$4, 5, 4, 86);
    			attr_dev(div1, "class", "xl:w-1/3 md:w-1/2 p-4");
    			add_location(div1, file$4, 4, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*info*/ 1 && !src_url_equal(img.src, img_src_value = /*info*/ ctx[0].url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*info*/ 1 && t1_value !== (t1_value = /*info*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*info*/ 1 && t3_value !== (t3_value = /*info*/ ctx[0].text + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('News', slots, []);
    	let { info } = $$props;
    	const writable_props = ['info'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('info' in $$props) $$invalidate(0, info = $$props.info);
    	};

    	$$self.$capture_state = () => ({ info });

    	$$self.$inject_state = $$props => {
    		if ('info' in $$props) $$invalidate(0, info = $$props.info);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [info];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { info: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*info*/ ctx[0] === undefined && !('info' in props)) {
    			console.warn("<News> was created without expected prop 'info'");
    		}
    	}

    	get info() {
    		throw new Error("<News>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<News>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\Home.svelte generated by Svelte v3.46.4 */
    const file$3 = "src\\routes\\Home.svelte";

    function create_fragment$3(ctx) {
    	let section0;
    	let h10;
    	let t1;
    	let div0;
    	let news0;
    	let t2;
    	let news1;
    	let t3;
    	let news2;
    	let t4;
    	let section1;
    	let div1;
    	let h11;
    	let current;

    	news0 = new News({
    			props: {
    				info: {
    					url: "https://kuyou.id/content/images/ctc_2020021605150668915.jpg",
    					title: "Chichen Itza",
    					text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche."
    				}
    			},
    			$$inline: true
    		});

    	news1 = new News({
    			props: {
    				info: {
    					url: "https://asset.kompas.com/crops/Pk_pN6vllxXy1RshYsEv74Q1BYA=/56x0:1553x998/750x500/data/photo/2021/06/16/60c8f9d68ff4a.jpg",
    					title: "Colosseum Roma",
    					text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche."
    				}
    			},
    			$$inline: true
    		});

    	news2 = new News({
    			props: {
    				info: {
    					url: "https://images.immediate.co.uk/production/volatile/sites/7/2019/07/33-GettyImages-154260931-216706f.jpg?quality=90&resize=768%2C574",
    					title: "Great Pyramid of Giza",
    					text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche."
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h10 = element("h1");
    			h10.textContent = "News";
    			t1 = space();
    			div0 = element("div");
    			create_component(news0.$$.fragment);
    			t2 = space();
    			create_component(news1.$$.fragment);
    			t3 = space();
    			create_component(news2.$$.fragment);
    			t4 = space();
    			section1 = element("section");
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "main section";
    			attr_dev(h10, "class", "news-head svelte-z1s6ol");
    			add_location(h10, file$3, 5, 2, 93);
    			attr_dev(div0, "class", "news-content svelte-z1s6ol");
    			add_location(div0, file$3, 6, 2, 127);
    			attr_dev(section0, "class", "news");
    			add_location(section0, file$3, 4, 0, 68);
    			add_location(h11, file$3, 32, 4, 1139);
    			add_location(div1, file$3, 31, 2, 1129);
    			attr_dev(section1, "class", "main-section");
    			add_location(section1, file$3, 30, 0, 1096);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h10);
    			append_dev(section0, t1);
    			append_dev(section0, div0);
    			mount_component(news0, div0, null);
    			append_dev(div0, t2);
    			mount_component(news1, div0, null);
    			append_dev(div0, t3);
    			mount_component(news2, div0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div1);
    			append_dev(div1, h11);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(news0.$$.fragment, local);
    			transition_in(news1.$$.fragment, local);
    			transition_in(news2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(news0.$$.fragment, local);
    			transition_out(news1.$$.fragment, local);
    			transition_out(news2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(news0);
    			destroy_component(news1);
    			destroy_component(news2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ News });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\routes\Gallery.svelte generated by Svelte v3.46.4 */

    const file$2 = "src\\routes\\Gallery.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div20;
    	let div0;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let div19;
    	let div3;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div1;
    	let h20;
    	let t6;
    	let h11;
    	let t8;
    	let p1;
    	let t10;
    	let div6;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div4;
    	let h21;
    	let t13;
    	let h12;
    	let t15;
    	let p2;
    	let t17;
    	let div9;
    	let div8;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let div7;
    	let h22;
    	let t20;
    	let h13;
    	let t22;
    	let p3;
    	let t24;
    	let div12;
    	let div11;
    	let img3;
    	let img3_src_value;
    	let t25;
    	let div10;
    	let h23;
    	let t27;
    	let h14;
    	let t29;
    	let p4;
    	let t31;
    	let div15;
    	let div14;
    	let img4;
    	let img4_src_value;
    	let t32;
    	let div13;
    	let h24;
    	let t34;
    	let h15;
    	let t36;
    	let p5;
    	let t38;
    	let div18;
    	let div17;
    	let img5;
    	let img5_src_value;
    	let t39;
    	let div16;
    	let h25;
    	let t41;
    	let h16;
    	let t43;
    	let p6;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div20 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Master Cleanse Reliac Heirloom";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical\n        gentrify, subway tile poke farm-to-table. Franzen you probably haven't\n        heard of them man bun deep jianbing selfies heirloom.";
    			t3 = space();
    			div19 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "THE SUBTITLE";
    			t6 = space();
    			h11 = element("h1");
    			h11.textContent = "Shooting Stars";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "THE SUBTITLE";
    			t13 = space();
    			h12 = element("h1");
    			h12.textContent = "The Catalyzer";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			t17 = space();
    			div9 = element("div");
    			div8 = element("div");
    			img2 = element("img");
    			t18 = space();
    			div7 = element("div");
    			h22 = element("h2");
    			h22.textContent = "THE SUBTITLE";
    			t20 = space();
    			h13 = element("h1");
    			h13.textContent = "The 400 Blows";
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			t24 = space();
    			div12 = element("div");
    			div11 = element("div");
    			img3 = element("img");
    			t25 = space();
    			div10 = element("div");
    			h23 = element("h2");
    			h23.textContent = "THE SUBTITLE";
    			t27 = space();
    			h14 = element("h1");
    			h14.textContent = "Neptune";
    			t29 = space();
    			p4 = element("p");
    			p4.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			t31 = space();
    			div15 = element("div");
    			div14 = element("div");
    			img4 = element("img");
    			t32 = space();
    			div13 = element("div");
    			h24 = element("h2");
    			h24.textContent = "THE SUBTITLE";
    			t34 = space();
    			h15 = element("h1");
    			h15.textContent = "Holden Caulfield";
    			t36 = space();
    			p5 = element("p");
    			p5.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			t38 = space();
    			div18 = element("div");
    			div17 = element("div");
    			img5 = element("img");
    			t39 = space();
    			div16 = element("div");
    			h25 = element("h2");
    			h25.textContent = "THE SUBTITLE";
    			t41 = space();
    			h16 = element("h1");
    			h16.textContent = "Alper Kamu";
    			t43 = space();
    			p6 = element("p");
    			p6.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing\n              microdosing tousled waistcoat.";
    			attr_dev(h10, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			add_location(h10, file$2, 3, 6, 150);
    			attr_dev(p0, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			add_location(p0, file$2, 8, 6, 298);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-20");
    			add_location(div0, file$2, 2, 4, 91);
    			attr_dev(img0, "alt", "gallery");
    			attr_dev(img0, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img0.src, img0_src_value = "https://dummyimage.com/600x360")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$2, 17, 10, 714);
    			attr_dev(h20, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h20, file$2, 25, 12, 1038);
    			attr_dev(h11, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h11, file$2, 30, 12, 1203);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$2, 33, 12, 1325);
    			attr_dev(div1, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div1, file$2, 22, 10, 895);
    			attr_dev(div2, "class", "flex relative");
    			add_location(div2, file$2, 16, 8, 676);
    			attr_dev(div3, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div3, file$2, 15, 6, 632);
    			attr_dev(img1, "alt", "gallery");
    			attr_dev(img1, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img1.src, img1_src_value = "https://dummyimage.com/601x361")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$2, 42, 10, 1626);
    			attr_dev(h21, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h21, file$2, 50, 12, 1950);
    			attr_dev(h12, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h12, file$2, 55, 12, 2115);
    			attr_dev(p2, "class", "leading-relaxed");
    			add_location(p2, file$2, 58, 12, 2236);
    			attr_dev(div4, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div4, file$2, 47, 10, 1807);
    			attr_dev(div5, "class", "flex relative");
    			add_location(div5, file$2, 41, 8, 1588);
    			attr_dev(div6, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div6, file$2, 40, 6, 1544);
    			attr_dev(img2, "alt", "gallery");
    			attr_dev(img2, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img2.src, img2_src_value = "https://dummyimage.com/603x363")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$2, 67, 10, 2537);
    			attr_dev(h22, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h22, file$2, 75, 12, 2861);
    			attr_dev(h13, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h13, file$2, 80, 12, 3026);
    			attr_dev(p3, "class", "leading-relaxed");
    			add_location(p3, file$2, 83, 12, 3147);
    			attr_dev(div7, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div7, file$2, 72, 10, 2718);
    			attr_dev(div8, "class", "flex relative");
    			add_location(div8, file$2, 66, 8, 2499);
    			attr_dev(div9, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div9, file$2, 65, 6, 2455);
    			attr_dev(img3, "alt", "gallery");
    			attr_dev(img3, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img3.src, img3_src_value = "https://dummyimage.com/602x362")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$2, 92, 10, 3448);
    			attr_dev(h23, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h23, file$2, 100, 12, 3772);
    			attr_dev(h14, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h14, file$2, 105, 12, 3937);
    			attr_dev(p4, "class", "leading-relaxed");
    			add_location(p4, file$2, 108, 12, 4052);
    			attr_dev(div10, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div10, file$2, 97, 10, 3629);
    			attr_dev(div11, "class", "flex relative");
    			add_location(div11, file$2, 91, 8, 3410);
    			attr_dev(div12, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div12, file$2, 90, 6, 3366);
    			attr_dev(img4, "alt", "gallery");
    			attr_dev(img4, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img4.src, img4_src_value = "https://dummyimage.com/605x365")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$2, 117, 10, 4353);
    			attr_dev(h24, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h24, file$2, 125, 12, 4677);
    			attr_dev(h15, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h15, file$2, 130, 12, 4842);
    			attr_dev(p5, "class", "leading-relaxed");
    			add_location(p5, file$2, 133, 12, 4966);
    			attr_dev(div13, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div13, file$2, 122, 10, 4534);
    			attr_dev(div14, "class", "flex relative");
    			add_location(div14, file$2, 116, 8, 4315);
    			attr_dev(div15, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div15, file$2, 115, 6, 4271);
    			attr_dev(img5, "alt", "gallery");
    			attr_dev(img5, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img5.src, img5_src_value = "https://dummyimage.com/606x366")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$2, 142, 10, 5267);
    			attr_dev(h25, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h25, file$2, 150, 12, 5591);
    			attr_dev(h16, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h16, file$2, 155, 12, 5756);
    			attr_dev(p6, "class", "leading-relaxed");
    			add_location(p6, file$2, 158, 12, 5874);
    			attr_dev(div16, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div16, file$2, 147, 10, 5448);
    			attr_dev(div17, "class", "flex relative");
    			add_location(div17, file$2, 141, 8, 5229);
    			attr_dev(div18, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div18, file$2, 140, 6, 5185);
    			attr_dev(div19, "class", "flex flex-wrap -m-4");
    			add_location(div19, file$2, 14, 4, 592);
    			attr_dev(div20, "class", "container px-5 py-24 mx-auto");
    			add_location(div20, file$2, 1, 2, 44);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div20);
    			append_dev(div20, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div20, t3);
    			append_dev(div20, div19);
    			append_dev(div19, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t6);
    			append_dev(div1, h11);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div19, t10);
    			append_dev(div19, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t13);
    			append_dev(div4, h12);
    			append_dev(div4, t15);
    			append_dev(div4, p2);
    			append_dev(div19, t17);
    			append_dev(div19, div9);
    			append_dev(div9, div8);
    			append_dev(div8, img2);
    			append_dev(div8, t18);
    			append_dev(div8, div7);
    			append_dev(div7, h22);
    			append_dev(div7, t20);
    			append_dev(div7, h13);
    			append_dev(div7, t22);
    			append_dev(div7, p3);
    			append_dev(div19, t24);
    			append_dev(div19, div12);
    			append_dev(div12, div11);
    			append_dev(div11, img3);
    			append_dev(div11, t25);
    			append_dev(div11, div10);
    			append_dev(div10, h23);
    			append_dev(div10, t27);
    			append_dev(div10, h14);
    			append_dev(div10, t29);
    			append_dev(div10, p4);
    			append_dev(div19, t31);
    			append_dev(div19, div15);
    			append_dev(div15, div14);
    			append_dev(div14, img4);
    			append_dev(div14, t32);
    			append_dev(div14, div13);
    			append_dev(div13, h24);
    			append_dev(div13, t34);
    			append_dev(div13, h15);
    			append_dev(div13, t36);
    			append_dev(div13, p5);
    			append_dev(div19, t38);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, img5);
    			append_dev(div17, t39);
    			append_dev(div17, div16);
    			append_dev(div16, h25);
    			append_dev(div16, t41);
    			append_dev(div16, h16);
    			append_dev(div16, t43);
    			append_dev(div16, p6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gallery', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\NotFound.svelte generated by Svelte v3.46.4 */

    const file$1 = "src\\routes\\NotFound.svelte";

    function create_fragment$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./img/404.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let tailwindcss;
    	let t0;
    	let div1;
    	let header1;
    	let header0;
    	let t1;
    	let slider;
    	let t2;
    	let main;
    	let div0;
    	let router;
    	let t3;
    	let footer;
    	let current;
    	tailwindcss = new Tailwindcss({ $$inline: true });
    	header0 = new Header({ $$inline: true });
    	slider = new Slider({ $$inline: true });

    	router = new Router({
    			props: {
    				routes: {
    					"/": Home,
    					"/contact": Contact,
    					"/gallery": Gallery,
    					"*": NotFound
    				}
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			header1 = element("header");
    			create_component(header0.$$.fragment);
    			t1 = space();
    			create_component(slider.$$.fragment);
    			t2 = space();
    			main = element("main");
    			div0 = element("div");
    			create_component(router.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			add_location(header1, file, 16, 2, 518);
    			attr_dev(div0, "class", "main-container svelte-14w96h3");
    			add_location(div0, file, 22, 4, 583);
    			add_location(main, file, 21, 2, 572);
    			attr_dev(div1, "class", "flex flex-col min-h-screen");
    			add_location(div1, file, 15, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header1);
    			mount_component(header0, header1, null);
    			append_dev(header1, t1);
    			mount_component(slider, header1, null);
    			append_dev(div1, t2);
    			append_dev(div1, main);
    			append_dev(main, div0);
    			mount_component(router, div0, null);
    			append_dev(div1, t3);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(header0.$$.fragment, local);
    			transition_in(slider.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(header0.$$.fragment, local);
    			transition_out(slider.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(header0);
    			destroy_component(slider);
    			destroy_component(router);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tailwindcss,
    		Router,
    		Header,
    		Slider,
    		Footer,
    		Contact,
    		Home,
    		Gallery,
    		NotFound
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
