var unpredictableEvent = function (params) {
	return $.extend({
		enabled: true,
		backupSelf: function() { this.enabled = false },
		effect: function() {},
		run: function() {
			if (this.enabled) {
				this.effect()
			}
		},
		restoreSelf: function() { this.enabled = true }
	}, params)
}