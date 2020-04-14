// define the collapse watchdog class
class CollapseManager {
  constructor(target_id) {
    this.target = document.getElementById(target_id);
    this.trigger = null;
    this.state = 0; // closed state.
  }

  setTrigger(trigger_id) {
    var manager = this;
    this.trigger = document.getElementById(trigger_id);
    this.trigger.addEventListener("click", function(){
      manager.toggle();
    });
  }

  toggle() {
    // if target is currently collapsed, uncollapse and add flip-image class from the trigger.
    if (this.state === 0) {
      // remove hide-mobile class from target.
      this.target.classList.remove('hide-mobile');

      //add flip-image class to trigger.
      this.trigger.classList.add("flip-image");
      this.state = 1; // uncollapsed state.
    }
    // if target is currently open, collapse and remove the flip-image class from the trigger.
    else {
      // add hide-mobile class to target.
      this.target.classList.add('hide-mobile');

      // remove flip-image class from trigger.
      this.trigger.classList.remove('flip-image');

      this.state = 0; // uncollapsed state.
    }

    console.log(this);
  }
};
