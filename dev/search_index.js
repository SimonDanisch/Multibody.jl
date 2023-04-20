var documenterSearchIndex = {"docs":
[{"location":"examples/pendulum/#Pendulum–The-\"Hello-World-of-multi-body-dynamics\"","page":"Hello world: Pendulum","title":"Pendulum–The \"Hello World of multi-body dynamics\"","text":"","category":"section"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"This beginners tutorial will model a pendulum pivoted around the origin in the world frame. The world frame is a constant that lives inside the Multibody module, all multibody models are \"grounded\" in the same world. To start, we load the required packages","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"using ModelingToolkit\nusing Multibody\nusing OrdinaryDiffEq # Contains the ODE solver we will use\nusing Plots","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"We then access the world frame and time variable from the Multibody module","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"t = Multibody.t\nworld = Multibody.world\nshow(stdout, MIME\"text/plain\"(), world)\nnothing # hide","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"Unless otherwise specified, the world defaults to have a gravitational field pointing in the negative y direction and an graivational acceleration of 981.","category":"page"},{"location":"examples/pendulum/#Modeling-the-pendulum","page":"Hello world: Pendulum","title":"Modeling the pendulum","text":"","category":"section"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"Our simple pendulum will initially consist of a Body and a Revolute joint (the pivot joint). We construct these elements by calling their constructors","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"@named joint = Revolute(n = [0, 0, 1], isroot = true)\n@named body = Body(; m = 1, isroot = false, r_cm = [0.5, 0, 0])\nnothing # hide","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"The n argument to Revolute denotes the rotational axis of the joint, this vector must have norm(n) == 1. We also indicate that the revolute joint is the root of the kinematic tree, i.e., the potential states of the joint will serve as the state variables for the system.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"The Body is constructed by providing its mass, m, and the vector r_cm from its first frame, body.frame_a, to the center of mass. Since the world by default has the gravity field pointing along the negative y axis, we place the center of mass along the x-axis to make the pendulum swing back and forth. The body is not selected as the root of the kinematic tree, since we have a joint in this system, but if we had attached the body directly to, e.g., a spring, we could set the body to be the root and avoid having to introduce an \"artificial joint\".","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"To connect the components together, we create a vector of connections using the connect function. A joint typically has two frames, frame_a and frame_b. The first frame of the joint is attached to the world frame, and the body is attached to the second joint frame. The order of the connections is not important for ModelingToolkit, but it's good practice to follow some convention, here, we start at the world and progress outwards in the kinematic tree.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"connections = [\n    connect(world.frame_b, joint.frame_a)\n    connect(joint.frame_b, body.frame_a)\n]\nnothing # hide","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"With all components and connections defined, we can create an ODESystem like so:","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"@named model = ODESystem(connections, t, systems=[world, joint, body])\nnothing # hide","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"The ODESystem is the fundamental model type in ModelingToolkit used for multibody-type models.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"Before we can simulate the system, we must perform model compilation using structural_simplify","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"ssys = structural_simplify(model, allow_parameter = false)","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"This results in a simplified model with the minimum required variables and equations to be able to simulate the system efficiently. This step rewrites all connect statements into the appropriate equations, and removes any redundant variables and equations.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"We are now ready to create an ODEProblem and simulate it. We use the Rodas4 solver from OrdinaryDiffEq.jl, and pass a dictionary for the initial conditions. We specify only initial condition for some variables, for those variables where no initial condition is specified, the default initial condition defined the model will be used.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"D = Differential(t)\ndefs = Dict(D(joint.phi) => 0, D(D(joint.phi)) => 0)\nprob = ODEProblem(ssys, defs, (0, 10))\n\nsol = solve(prob, Rodas4())\nplot(sol, idxs = joint.phi, title=\"Pendulum\")","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"The solution sol can be plotted directly if the Plots package is loaded. The figure indicates that the pendulum swings back and forth without any damping. To add damping as well, we could add a Damper from the ModelingToolkitStandardLibrary.Mechanical.Rotational module to the revolute joint. We do this below","category":"page"},{"location":"examples/pendulum/#Adding-damping","page":"Hello world: Pendulum","title":"Adding damping","text":"","category":"section"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"To add damping to the pendulum such that the pendulum will eventually come to rest, we add a Damper to the revolute joint. The damping coefficient is given by d, and the damping force is proportional to the angular velocity of the joint. To add the damper to the revolute joint, we must create the joint with the keyword argument useAxisFlange = true, this adds two internal flanges to the joint to which you can attach components from the ModelingToolkitStandardLibrary.Mechanical.Rotational module. We then connect one of the flanges of the damper to the axis flange of the joint, and the other damper flange to the support flange which is rigidly attached to the world.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"using ModelingToolkitStandardLibrary.Mechanical.Rotational\n\n@named damper = Damper(d = 0.1)\n@named joint = Revolute(n = [0, 0, 1], isroot = true, useAxisFlange = true)\n\nconnections = [connect(world.frame_b, joint.frame_a)\n               connect(damper.flange_b, joint.axis)\n               connect(joint.support, damper.flange_a)\n               connect(body.frame_a, joint.frame_b)]\n\n@named model = ODESystem(connections, t, systems = [world, joint, body, damper])\nssys = structural_simplify(model, allow_parameter = false)\n\nprob = ODEProblem(ssys, [damper.phi_rel => 1, D(joint.phi) => 0, D(D(joint.phi)) => 0],\n                  (0, 30))\n\nsol = solve(prob, Rodas4())\nplot(sol, idxs = joint.phi, title=\"Damped pendulum\")","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"This time we see that the pendulum loses energy and eventually comes to rest at the stable equilibrium point pi  2.","category":"page"},{"location":"examples/pendulum/#A-linear-pendulum?","page":"Hello world: Pendulum","title":"A linear pendulum?","text":"","category":"section"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"When we think of a pendulum, we typically think of a rotary pendulum that is rotating around a pivot point like in the examples above.  A mass suspended in a spring can be though of as a linear pendulum (often referred to as a harmonic oscillator rather than a pendulum), and we show here how we can construct a model of such a device. This time around, we make use of a Prismatic joint rather than a Revolute joint. A prismatic joint has one positional degree of freedom, compared to the single rotational degree of freedom for the revolute joint.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"import ModelingToolkitStandardLibrary.Mechanical.TranslationalModelica as T\n\n@named damper = T.Damper(0.5)\n@named spring = T.Spring(1)\n@named joint = Prismatic(n = [0, 1, 0], isroot = true, useAxisFlange = true)\n\nconnections = [connect(world.frame_b, joint.frame_a)\n               connect(damper.flange_b, spring.flange_b, joint.axis)\n               connect(joint.support, damper.flange_a, spring.flange_a)\n               connect(body.frame_a, joint.frame_b)]\n\n@named model = ODESystem(connections, t, systems = [world, joint, body, damper, spring])\nssys = structural_simplify(model, allow_parameter = false)\n\nprob = ODEProblem(ssys, [damper.s_rel => 1, D(joint.s) => 0, D(D(joint.s)) => 0],\n                  (0, 30))\n\nsol = solve(prob, Rodas4())\nplot(sol, idxs = joint.s, title=\"Mass-spring-damper system\")","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"As is hopefully evident from the little code snippet above, this linear pendulum model has a lot in common with the rotary pendulum. In this example, we connected both the spring and a damper to the same axis flange in the joint. This time, the components came from the TranslationalModelica submodule of ModelingToolkitStandardLibrary rather than the Rotational submodule. Also here do we pass useAxisFlange when we create the joint to make sure that it is equipped with the flanges support and axis needed to connect the translational components.","category":"page"},{"location":"examples/pendulum/#Why-do-we-need-a-joint?","page":"Hello world: Pendulum","title":"Why do we need a joint?","text":"","category":"section"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"In the example above, we introduced a prismatic joint to model the oscillating motion of the mass-spring system. In reality, we can suspend a mass in a spring without any joint, so why do we need one here? The answer is that we do not, in fact, need the joint, but if we connect the spring directly to the world, we need to make the body (mass) the root object of the kinematic tree instead:","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"using SymbolicIR\n@named root_body = Body(; m = 1, isroot = true, r_cm = [0, 1, 0], phi0 = [0, 1, 0])\n@named multibody_spring = Multibody.Spring(1)\n\nconnections = [connect(world.frame_b, multibody_spring.frame_a)\n                connect(root_body.frame_a, multibody_spring.frame_b)]\n\n@named model = ODESystem(connections, t, systems = [world, multibody_spring, root_body])\nssys = structural_simplify(IRSystem(expand_connections(model)))\n\ndefs = Dict(collect(multibody_spring.r_rel_0 .=> [0, 1, 0])...,\n            collect(root_body.r_0 .=> [0, 0, 0])...,\n            collect((D.(root_body.phi)) .=> [0, 0, 0])...,\n            collect(D.(D.(root_body.phi)) .=> [0, 0, 0])...)\n\nprob = ODEProblem(ssys, defs, (0, 30))\n\nsol = solve(prob, Rodas4())\nplot(sol, idxs = multibody_spring.r_rel_0[2], title=\"Mass-spring system without joint\")","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"Here, we used a Multibody.Spring instead of connecting a Translational.Spring to a joint. The Translational.Spring, alongside other components from ModelingToolkitStandardLibrary.Mechanical, is a 1-dimensional object, whereas multibody components are 3-dimensional objects.","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"Internally, the Multibody.Spring contains a Translational.Spring, attached between two flanges, so we could actually add a damper to the system as well:","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"push!(connections, connect(multibody_spring.spring2d.flange_a, damper.flange_a))\npush!(connections, connect(multibody_spring.spring2d.flange_b, damper.flange_b))\n\n@named model = ODESystem(connections, t, systems = [world, multibody_spring, root_body, damper])\nssys = structural_simplify(IRSystem(expand_connections(model)))\nprob = ODEProblem(ssys, defs, (0, 30))\n\nsol = solve(prob, Rodas4())\nplot(sol, idxs = multibody_spring.r_rel_0[2], title=\"Mass-spring-damper without joint\")","category":"page"},{"location":"examples/pendulum/","page":"Hello world: Pendulum","title":"Hello world: Pendulum","text":"The figure above should look identical to the simulation of the mass-spring-damper further above.","category":"page"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = Multibody","category":"page"},{"location":"#Multibody","page":"Home","title":"Multibody","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Documentation for Multibody.","category":"page"},{"location":"","page":"Home","title":"Home","text":"","category":"page"},{"location":"","page":"Home","title":"Home","text":"Modules = [Multibody]","category":"page"},{"location":"#Multibody.world","page":"Home","title":"Multibody.world","text":"The world component is the root of all multibody models. It is a fixed frame with a parallel gravitational field and a gravity vector specified by the unit direction world.n (defaults to [0, -1, 0]) and magnitude world.g (defaults to 9.81).\n\n\n\n\n\n","category":"constant"},{"location":"#Multibody.Body-Tuple{}","page":"Home","title":"Multibody.Body","text":"Body(; name, m = 1, r_cm, I = collect(0.001 * LinearAlgebra.I(3)), isroot = false, phi0 = zeros(3), phid0 = zeros(3))\n\nRepresenting a body with 3 translational and 3 rotational degrees-of-freedom.\n\nm: Mass\nr_cm: Vector from frame_a to center of mass, resolved in frame_a\nI: Inertia matrix of the body\nisroot: Indicate whether this component is the root of the system, useful when there are no joints in the model.\nphi0: Initial orientation, only applicable if isroot = true\nphid0: Initial angular velocity\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.Prismatic-Tuple{}","page":"Home","title":"Multibody.Prismatic","text":"Prismatic(; name, n = [0, 0, 1], useAxisFlange = false, isroot = false)\n\nPrismatic joint with 1 translational degree-of-freedom\n\nn: The axis of motion (unit vector)\nuseAxisFlange: If true, the joint will have two additional frames from Mechanical.Translational, axis and support, between which translational components such as springs and dampers can be connected.\nisroot: If true, the joint will be considered the root of the system.\n\nIf useAxisFlange, flange connectors for ModelicaStandardLibrary.Mechanics.TranslationalModelica are also available:\n\naxis: 1-dim. translational flange that drives the joint\nsupport: 1-dim. translational flange of the drive support (assumed to be fixed in the world frame, NOT in the joint)\n\nThe function returns an ODESystem representing the prismatic joint.\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.Revolute-Tuple{}","page":"Home","title":"Multibody.Revolute","text":"Revolute(; name, phi0 = 0, w0 = 0, n, useAxisFlange = false)\n\nRevolute joint with 1 rotational degree-of-freedom\n\nphi0: Initial angle\nw0: Iniitial angular velocity\nn: The axis of rotation\nuseAxisFlange: If true, the joint will have two additional frames from Mechanical.Rotational, axis and support, between which rotational components such as springs and dampers can be connected.\n\nIf useAxisFlange, flange connectors for ModelicaStandardLibrary.Mechanics.Rotational are also available:\n\naxis: 1-dim. rotational flange that drives the joint\nsupport: 1-dim. rotational flange of the drive support (assumed to be fixed in the world frame, NOT in the joint)\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.abs_rotation-Tuple{Any, Any}","page":"Home","title":"Multibody.abs_rotation","text":"R2 = abs_rotation(R1, R_rel)\n\nR1: Orientation object to rotate frame 0 into frame 1\nR_rel: Orientation object to rotate frame 1 into frame 2\nR2: Orientation object to rotate frame 0 into frame 2\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.at_variables_t-Tuple","page":"Home","title":"Multibody.at_variables_t","text":"at_variables_t(args)\n\nEmulates the @variables macro but does never creates array variables. Also never introuces the variable names into the calling scope.\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.axisRotation-Tuple{Any, Any}","page":"Home","title":"Multibody.axisRotation","text":"axisRotation(sequence, angle; name = :R)\n\nGenerate a rotation matrix for a rotation around the specified axis.\n\nsequence: The axis to rotate around (1: x-axis, 2: y-axis, 3: z-axis)\nangle: The angle of rotation (in radians)\n\nReturns a RotationMatrix object.\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.gravity_acceleration-Tuple{Any}","page":"Home","title":"Multibody.gravity_acceleration","text":"Compute the gravity acceleration, resolved in world frame\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.resolve1-Tuple{RotationMatrix, Any}","page":"Home","title":"Multibody.resolve1","text":"h1 = resolve1(R21, h2)\n\nR12 is a 3x3 matrix that transforms a vector from frame 1 to frame 2. h2 is a vector resolved in frame 2. h1 is the same vector in frame 1.\n\nTypical usage:\n\nresolve1(ori(frame_a), r_ab)\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.resolve2-Tuple{RotationMatrix, Any}","page":"Home","title":"Multibody.resolve2","text":"h2 = resolve2(R21, h1)\n\nR21 is a 3x3 matrix that transforms a vector from frame 1 to frame 2. h1 is a vector resolved in frame 1. h2 is the same vector in frame 2.\n\nTypical usage:\n\nresolve2(ori(frame_a), a_0 - g_0)\n\n\n\n\n\n","category":"method"},{"location":"#Multibody.rotx","page":"Home","title":"Multibody.rotx","text":"rotx(t, deg = false)\n\nGenerate a rotation matrix for a rotation around the x-axis.\n\nt: The angle of rotation (in radians, unless deg is set to true)\ndeg: (Optional) If true, the angle is in degrees\n\nReturns a 3x3 rotation matrix.\n\n\n\n\n\n","category":"function"},{"location":"#Multibody.roty","page":"Home","title":"Multibody.roty","text":"roty(t, deg = false)\n\nGenerate a rotation matrix for a rotation around the y-axis.\n\nt: The angle of rotation (in radians, unless deg is set to true)\ndeg: (Optional) If true, the angle is in degrees\n\nReturns a 3x3 rotation matrix.\n\n\n\n\n\n","category":"function"},{"location":"#Multibody.rotz","page":"Home","title":"Multibody.rotz","text":"rotz(t, deg = false)\n\nGenerate a rotation matrix for a rotation around the z-axis.\n\nt: The angle of rotation (in radians, unless deg is set to true)\ndeg: (Optional) If true, the angle is in degrees\n\nReturns a 3x3 rotation matrix.\n\n\n\n\n\n","category":"function"}]
}
