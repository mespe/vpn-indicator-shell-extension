const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

const VpnIndicator = new Lang.Class({
    Name: 'VpnIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "VPN Indicator", false);
        this.buttonIcon = this._icon = new St.Icon({ icon_name: 'network-vpn-disconnected-symbolic', style_class: 'system-status-icon' })

        this.actor.add_actor(this.buttonIcon);
        this._refresh();
    },

    _checkVPN: function() {
        let [res, out, err, exit] = GLib.spawn_sync(null, ["/bin/bash", "-c", "ifconfig -a | grep tun0"], null, GLib.SpawnFlags.SEARCH_PATH, null);

        return exit;
    },

    _refresh: function() {
        this._refreshUI(this._checkVPN());

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
    },

    _refreshUI: function(data) {
        var icon;

        if (data == 256) {
            icon = "network-vpn-disconnected-symbolic";
        } else if (data == 0) {
            icon = "network-vpn-symbolic";
        } else {
            icon = "network-vpn-error-symbolic";
        }

        this.buttonIcon.set_icon_name(icon);
    }
});

let twMenu;

function init() {
}

function enable() {
    twMenu = new VpnIndicator;
    Main.panel.addToStatusArea('vpn-indicator', twMenu);
}

function disable() {
    twMenu.destroy();
}
