# Limitations

- The CartPole model is narrow and synthetic: it learns one nominal environment, three discrete actions, and short control horizons. It is not LeWorldModel, a foundation world model, or a model that creates new environments from arbitrary course pages.
- The visual representation is physics-grounded during training through a small state probe. That improves the educational prototype but means it is not a purely reward-free or supervision-free JEPA.
- The learned transition plans; analytic CartPole dynamics judge the result. Hidden friction is intentionally out of distribution and can break the plan.
- The current dataset is procedurally generated rather than collected from a camera or physical robot. A real robotics version needs observation noise, actuation delay, safety constraints, and hardware validation.
- Source image and PDF understanding require GPT vision. Local llama.cpp mode currently handles pasted text only.
