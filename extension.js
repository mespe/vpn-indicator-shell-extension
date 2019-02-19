const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;

class VpnIndicator extends PanelMenu.SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'network-vpn-disconnected-symbolic';

        Main.panel.statusArea.aggregateMenu._indicators.insert_child_at_index(this.indicators, 0);

        this._refresh();
    }

    _checkVPN() {
        let [res, out, err, exit] = GLib.spawn_sync(null, ["/bin/bash", "-c", "ifconfig -a | grep tun0"], null, GLib.SpawnFlags.SEARCH_PATH, null);

        return exit;
    }

    _refresh() {
        this._refreshUI(this._checkVPN());

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
    }

    _refreshUI(data) {
        if (data == 256) {
            this._indicator.icon_name = "network-vpn-disconnected-symbolic";
        } else if (data == 0) {
            this._indicator.icon_name = "network-vpn-symbolic";
        } else {
            this._indicator.icon_name = "network-vpn-error-symbolic";
        }
    }

    destroy() {
        this.indicators.destroy();
    }
}

let vpnIndicator = null;

function init() {

}

function enable() {
    vpnIndicator = new VpnIndicator;
}

function disable() {
    vpnIndicator.destroy();
}
