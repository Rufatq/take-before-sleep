// Clamped semi-implicit Euler springs & Sakurai hitstop impact model.

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  stiffness: number;
  damping: number;

  constructor(initial: number, stiffness = 180, damping = 18) {
    this.value = initial;
    this.target = initial;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  snap(v: number): void {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  impulse(dv: number): void {
    this.velocity += dv;
  }

  step(dt: number): number {
    const cdt = Math.min(dt, 1 / 30);
    const force = (this.target - this.value) * this.stiffness;
    const accel = force - this.velocity * this.damping;
    this.velocity += accel * cdt;
    this.value += this.velocity * cdt;
    return this.value;
  }
}

export interface ImpactState {
  hitstopFrames: number;
  flashFrames: number;
  flashMaxFrames: number;
  shakeMag: number;
  shakeTimer: number;
  shakeDuration: number;
  originX: number;
  originY: number;
}

export function createImpactState(): ImpactState {
  return {
    hitstopFrames: 0,
    flashFrames: 0,
    flashMaxFrames: 3,
    shakeMag: 0,
    shakeTimer: 0,
    shakeDuration: 0.16,
    originX: 0.5,
    originY: 0.5,
  };
}

export function triggerImpact(
  imp: ImpactState,
  originX: number,
  originY: number,
  hitstopFrames = 3,
  flashFrames = 3,
  shakeMag = 7.5
): void {
  imp.hitstopFrames = hitstopFrames;
  imp.flashFrames = flashFrames;
  imp.flashMaxFrames = flashFrames;
  imp.shakeMag = shakeMag;
  imp.shakeTimer = imp.shakeDuration;
  imp.originX = originX;
  imp.originY = originY;
}
