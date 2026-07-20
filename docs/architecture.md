# Architecture

One React shell owns the CartPole world-model lab, source interpretation, and the earlier causal-learning missions. Independent deterministic engines remain the authoritative environment references. `app/api/analyze` routes source interpretation to local llama.cpp or optional GPT and validates the resulting blueprint.

The CartPole vertical slice adds a real latent world-model loop:

1. A renderer converts consecutive CartPole states into two 24 × 24 grayscale observations.
2. A learned encoder maps the observation pair into an eight-dimensional latent state.
3. An action-conditioned transition network predicts the next latent for left, coast, or right.
4. Cross-Entropy Method search evaluates candidate action sequences in latent space.
5. Model Predictive Control executes the first action, observes reality, and replans.
6. The analytic CartPole environment judges the action. Hidden friction exposes distribution shift through latent prediction error.

The encoder and transition contain 149,776 learned parameters and are trained on 28,000 procedurally generated nominal transitions. A small physics probe is trained jointly to make the learned representation inspectable. This is a physics-grounded visual latent model, not a claim of reward-free general world modeling.

The pendulum vertical slice deliberately separates five concerns:

1. The domain engine advances the authoritative physical state with RK4 integration.
2. The Three.js world turns that state into a spatial experiment, energy traces, and accessible values.
3. A trained 818-parameter transition network forecasts the next physical state and is checked against the reference engine.
4. The learner-state engine updates a probability distribution over three misconceptions and transfer readiness from observable student evidence.
5. The experiment selector estimates information gain and targets the next controlled experiment at the most useful uncertainty.

The predictive network never replaces the physics reference, and the learner-state probabilities are inspectable hypotheses rather than psychological diagnoses. The AI tutor layer can use local llama.cpp during development or GPT later; the core judged path remains deterministic.
