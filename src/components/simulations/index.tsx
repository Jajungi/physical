import { SimPlaceholder } from './SimPlaceholder'
import { OhmRCSim, RLCSim, WheatstoneSim } from './CircuitSims'
import { EquipotentialSim } from './EquipotentialSim'
import {
  BrewsterSim,
  DoubleSlitSim,
  HysteresisSim,
  MagneticBalanceSim,
  MagneticFieldSim,
} from './FieldSims'

interface UnitSimulationProps {
  unitId: number
}

export function UnitSimulation({ unitId }: UnitSimulationProps) {
  switch (unitId) {
    case 1:
      return <EquipotentialSim />
    case 2:
      return <OhmRCSim />
    case 3:
      return <WheatstoneSim />
    case 4:
      return <MagneticFieldSim />
    case 5:
      return <HysteresisSim />
    case 6:
      return <MagneticBalanceSim />
    case 7:
      return <RLCSim />
    case 8:
      return <BrewsterSim />
    case 9:
      return <DoubleSlitSim />
    case 10:
      return <SimPlaceholder />
    default:
      return null
  }
}
