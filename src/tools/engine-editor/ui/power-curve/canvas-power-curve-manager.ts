import { useState, useEffect } from 'react';
import { CanvasChartManager } from '../chart/canvas-chart-manager';
import { horsepowerFromSiValue } from 'src/utils/utils';

export type PowerUnit = 'kw' | 'hp';
export type TorqueUnit = 'nm';

export interface PowerCurveOptions {
  bars?: number;
  maxRPM?: number;
  maxTorque?: number;
  powerUnit?: PowerUnit;
  torqueUnit?: TorqueUnit;
  showPowerCurve?: boolean;
  showTorqueCurve?: boolean;
}

export class CanvasPowerCurveManager extends CanvasChartManager {
  private bars: number;
  private maxRPM: number;
  private maxTorque: number;
  private powerUnit: PowerUnit;
  private torqueUnit: TorqueUnit;
  private showPowerCurve: boolean;
  private showTorqueCurve: boolean;
  private maxPower: number = 0;
  private maxPowerRpm: number = 0;
  private maxTorquePoint: { rpm: number; torque: number } | null = null;

  // Data storage
  private fullThrottleTorquePoints: number[] = [];
  private coastingTorquePoints: number[] = [];

  constructor(options: PowerCurveOptions = {}) {
    super();
    this.bars = options.bars ?? 100;
    this.maxRPM = options.maxRPM ?? 7000;
    this.maxTorque = options.maxTorque ?? 500;
    this.powerUnit = options.powerUnit ?? 'kw';
    this.torqueUnit = options.torqueUnit ?? 'nm';
    this.showPowerCurve = options.showPowerCurve ?? true;
    this.showTorqueCurve = options.showTorqueCurve ?? true;
    
    // Initialize arrays with a more realistic torque curve shape
    // This creates a curve that rises to peak torque at 1/3 of max RPM
    // then gradually drops off
    this.fullThrottleTorquePoints = Array(this.bars).fill(0).map((_, index) => {
      const normalizedRPM = index / (this.bars - 1);
      
      // Create a curve that peaks at around 1/3 of the RPM range
      // and then gradually drops by about 15% at max RPM
      if (normalizedRPM < 0.3) {
        // Ramps up to peak torque
        return 0.85 + (normalizedRPM / 0.3) * 0.15;
      } else {
        // Gradually drops off from peak
        return 1.0 - ((normalizedRPM - 0.3) / 0.7) * 0.15;
      }
    });
    
    // Initialize coasting torque points as flat for now
    this.coastingTorquePoints = Array(this.bars).fill(0.5);
    
    // Set appropriate margin for the power curve chart
    this.setMargin({ top: 30, right: 30, bottom: 30, left: 30 });
  }

  // Getters and setters
  public getBars(): number {
    return this.bars;
  }

  public getMaxRPM(): number {
    return this.maxRPM;
  }

  public setMaxRPM(rpm: number): void {
    this.maxRPM = rpm;
    this.emit('changed');
  }

  public getMaxTorque(): number {
    return this.maxTorque;
  }

  public setMaxTorque(torque: number): void {
    this.maxTorque = torque;
    this.emit('changed');
  }

  public getMinTorque(): number {
    return -this.maxTorque;
  }

  public getPowerUnit(): PowerUnit {
    return this.powerUnit;
  }

  public setPowerUnit(unit: PowerUnit): void {
    this.powerUnit = unit;
    this.emit('changed');
  }

  public getTorqueUnit(): TorqueUnit {
    return this.torqueUnit;
  }

  public setTorqueUnit(unit: TorqueUnit): void {
    this.torqueUnit = unit;
    this.emit('changed');
  }

  public getShowPowerCurve(): boolean {
    return this.showPowerCurve;
  }

  public setShowPowerCurve(show: boolean): void {
    this.showPowerCurve = show;
    this.emit('changed');
  }

  public getShowTorqueCurve(): boolean {
    return this.showTorqueCurve;
  }

  public setShowTorqueCurve(show: boolean): void {
    this.showTorqueCurve = show;
    this.emit('changed');
  }

  public getMaxPower(): number {
    return this.maxPower;
  }

  public getMaxPowerRpm(): number {
    return this.maxPowerRpm;
  }

  public getMaxTorquePoint(): { rpm: number; torque: number } | null {
    return this.maxTorquePoint;
  }

  // Data methods
  public getFullThrottleTorquePoints(): number[] {
    return this.fullThrottleTorquePoints;
  }

  public getCoastingTorquePoints(): number[] {
    return this.coastingTorquePoints;
  }

  public setTorquePoint(index: number, value: number, isFullThrottle: boolean): void {
    // Ensure value is normalized between 0 and 1
    const normalizedValue = Math.max(0, Math.min(1, value));
    
    if (isFullThrottle) {
      this.fullThrottleTorquePoints[index] = normalizedValue;
    } else {
      this.coastingTorquePoints[index] = normalizedValue;
    }
    
    this.emit('changed');
    if (isFullThrottle) {
      // Emit a specific event for engine integration
      this.emit('torque-map-changed', this.getTorqueMapForEngine());
    }
  }

  public getBarWidth(canvasWidth: number): number {
    const margin = this.getMargin();
    return (canvasWidth - margin.left - margin.right) / this.bars;
  }

  // Calculate power and find max power/torque points
  public calculatePowerCurve() {
    let maxPower = 0;
    let maxPowerRpm = 0;
    let maxTorque = 0;
    let maxTorqueRpm = 0;

    for (let i = 0; i < this.bars; i++) {
      const rpm = (i / (this.bars - 1)) * this.maxRPM;
      const torqueNormalized = this.fullThrottleTorquePoints[i];
      const torque = torqueNormalized * this.maxTorque;
      
      // Calculate power in kW: P = T × ω ÷ 9549
      // where T is torque in Nm, ω is angular velocity in RPM
      const power = (torque * rpm) / 9549;
      
      if (power > maxPower) {
        maxPower = power;
        maxPowerRpm = rpm;
      }
      
      if (torque > maxTorque) {
        maxTorque = torque;
        maxTorqueRpm = rpm;
      }
    }
    
    this.maxPower = maxPower;
    this.maxPowerRpm = maxPowerRpm;
    this.maxTorquePoint = { rpm: maxTorqueRpm, torque: maxTorque };
    
    return {
      maxPower,
      maxPowerRpm,
      maxTorquePoint: this.maxTorquePoint
    };
  }

  // Format power value according to selected units
  public formatPower(power: number): string {
    if (this.powerUnit === 'hp') {
      return `${horsepowerFromSiValue(power * 1000).toFixed(2)} hp`;
    }
    return `${power.toFixed(2)} kW`;
  }

  // Format torque value
  public formatTorque(torque: number): string {
    return `${torque.toFixed(2)} Nm`;
  }

  // Format RPM value
  public formatRpm(rpm: number): string {
    return `${rpm.toFixed(0)} RPM`;
  }

  // Get data for a specific RPM point (for tooltips, etc.)
  public getDataAtRpm(rpm: number): { rpm: number; torque: number; power: number } {
    const index = Math.min(this.bars - 1, Math.max(0, Math.floor((rpm / this.maxRPM) * this.bars)));
    const normalizedTorque = this.fullThrottleTorquePoints[index];
    const torque = normalizedTorque * this.maxTorque;
    const power = (torque * rpm) / 9549;
    
    return {
      rpm,
      torque,
      power
    };
  }

  // Gets the data at a specific index
  public getDataAtIndex(index: number): { rpm: number; torque: number; power: number } {
    const safeIndex = Math.min(this.bars - 1, Math.max(0, index));
    const rpm = (safeIndex / (this.bars - 1)) * this.maxRPM;
    return this.getDataAtRpm(rpm);
  }

  // React hooks specific to power curve
  public useMaxRPM() {
    const [value, setValue] = useState(this.maxRPM);
    
    useEffect(() => {
      const handleChange = () => setValue(this.maxRPM);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useMaxTorque() {
    const [value, setValue] = useState(this.maxTorque);
    
    useEffect(() => {
      const handleChange = () => setValue(this.maxTorque);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useShowPowerCurve() {
    const [value, setValue] = useState(this.showPowerCurve);
    
    useEffect(() => {
      const handleChange = () => setValue(this.showPowerCurve);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useShowTorqueCurve() {
    const [value, setValue] = useState(this.showTorqueCurve);
    
    useEffect(() => {
      const handleChange = () => setValue(this.showTorqueCurve);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useMaxPower() {
    const [value, setValue] = useState(this.maxPower);
    
    useEffect(() => {
      const handleChange = () => {
        this.calculatePowerCurve();
        setValue(this.maxPower);
      };
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useMaxPowerRpm() {
    const [value, setValue] = useState(this.maxPowerRpm);
    
    useEffect(() => {
      const handleChange = () => {
        this.calculatePowerCurve();
        setValue(this.maxPowerRpm);
      };
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useMaxTorquePoint() {
    const [value, setValue] = useState(this.maxTorquePoint);
    
    useEffect(() => {
      const handleChange = () => {
        this.calculatePowerCurve();
        setValue(this.maxTorquePoint);
      };
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public usePowerUnit() {
    const [value, setValue] = useState(this.powerUnit);
    
    useEffect(() => {
      const handleChange = () => setValue(this.powerUnit);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  public useTorqueUnit() {
    const [value, setValue] = useState(this.torqueUnit);
    
    useEffect(() => {
      const handleChange = () => setValue(this.torqueUnit);
      this.on('changed', handleChange);
      return () => this.off('changed', handleChange);
    }, []);
    
    return value;
  }

  /**
   * Get the torque map in a format that can be used by the TankEngineUnit
   * Returns an array of { rpm, torque } points representing the current curve
   */
  public getTorqueMapForEngine(): { rpm: number; torque: number }[] {
    const torqueMap: { rpm: number; torque: number }[] = [];
    
    // Create a point for each bar in the chart
    for (let i = 0; i < this.bars; i++) {
      const rpm = (i / (this.bars - 1)) * this.maxRPM;
      const normalizedTorque = this.fullThrottleTorquePoints[i];
      const torque = normalizedTorque * this.maxTorque;
      
      torqueMap.push({ rpm, torque });
    }
    
    return torqueMap;
  }
}