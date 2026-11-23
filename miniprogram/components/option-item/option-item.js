Component({
  properties: {
    name: { type: String, value: '' },
    priceText: { type: String, value: '' },
    checked: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    type: { type: String, value: 'radio' },
    zeroMuted: { type: Boolean, value: true }
  },
  methods: {
    onTap() {
      if (this.data.disabled) return;
      this.triggerEvent('change');
    }
  }
});
