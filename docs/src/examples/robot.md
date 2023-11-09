# Industrial robot

![animation](robot.gif)

```@example robot
using Multibody
using ModelingToolkit
using Plots
using JuliaSimCompiler
using OrdinaryDiffEq
using Test

t = Multibody.t
D = Differential(t)
@named robot = Multibody.Robot6DOF(trivial=true)
robot = complete(robot)

length(equations(robot))
```
The robot is a medium sized system with some 2000 equations before simplification.

After simplification, the following states are chosen:
```@example robot
ssys = structural_simplify(IRSystem(robot))
states(ssys)
```
    
```@example robot
prob = ODEProblem(ssys, [
    robot.mechanics.r1.phi => deg2rad(-60)
    robot.mechanics.r2.phi => deg2rad(20)
    robot.mechanics.r3.phi => deg2rad(90)
    robot.mechanics.r4.phi => deg2rad(0)
    robot.mechanics.r5.phi => deg2rad(-110)
    robot.mechanics.r6.phi => deg2rad(0)

    robot.axis1.motor.Jmotor.phi => deg2rad(-60) *  -105 # Multiply by gear ratio
    robot.axis2.motor.Jmotor.phi => deg2rad(20) *  210
    robot.axis3.motor.Jmotor.phi => deg2rad(90) *  60
], (0.0, 4.0))
sol = solve(prob, Rodas5P(autodiff=false));
@test SciMLBase.successful_retcode(sol)

plot(sol, idxs = [
    robot.pathPlanning.controlBus.axisControlBus1.angle_ref
    robot.pathPlanning.controlBus.axisControlBus2.angle_ref
    robot.pathPlanning.controlBus.axisControlBus3.angle_ref
    robot.pathPlanning.controlBus.axisControlBus4.angle_ref
    robot.pathPlanning.controlBus.axisControlBus5.angle_ref
    robot.pathPlanning.controlBus.axisControlBus6.angle_ref
], layout=(4,3), size=(800,800), l=(:black, :dash), legend=:outertop, legendfontsize=6)
plot!(sol, idxs = [
    robot.pathPlanning.controlBus.axisControlBus1.angle
    robot.pathPlanning.controlBus.axisControlBus2.angle
    robot.pathPlanning.controlBus.axisControlBus3.angle
    robot.pathPlanning.controlBus.axisControlBus4.angle
    robot.pathPlanning.controlBus.axisControlBus5.angle
    robot.pathPlanning.controlBus.axisControlBus6.angle
], sp=1:6)

plot!(sol, idxs = [
    robot.axis1.controller.feedback1.output.u
    robot.axis2.controller.feedback1.output.u
    robot.axis3.controller.feedback1.output.u
    robot.axis4.controller.feedback1.output.u
    robot.axis5.controller.feedback1.output.u
    robot.axis6.controller.feedback1.output.u
], sp=7:12, lab="Position error", link=:x)
plot!(xlabel=[fill("", 1, 9) fill("Time [s]", 1, 3)])
```
We see that after an initial transient, the robot controller converges to tracking the reference trajectory well.



## 3D animation
Multibody.jl supports automatic 3D rendering of mechanisms, we use this feature to illustrate the result of the simulation below:

```@example robot
import CairoMakie
Multibody.render(robot, sol; z = -5, filename = "robot.gif")
nothing # hide
```

![animation](robot.gif)