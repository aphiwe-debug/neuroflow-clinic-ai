
-- Deny anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny anonymous update to profiles"
  ON public.profiles FOR UPDATE
  TO anon
  USING (false);

-- Deny anonymous access to patients
CREATE POLICY "Deny anonymous access to patients"
  ON public.patients FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny anonymous insert to patients"
  ON public.patients FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "Deny anonymous update to patients"
  ON public.patients FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "Deny anonymous delete to patients"
  ON public.patients FOR DELETE
  TO anon
  USING (false);

-- Deny anonymous access to ai_recommendations
CREATE POLICY "Deny anonymous access to ai_recommendations"
  ON public.ai_recommendations FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous access to appointments
CREATE POLICY "Deny anonymous access to appointments"
  ON public.appointments FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous access to subscriptions
CREATE POLICY "Deny anonymous access to subscriptions"
  ON public.subscriptions FOR SELECT
  TO anon
  USING (false);

-- Deny anonymous access to user_roles
CREATE POLICY "Deny anonymous access to user_roles"
  ON public.user_roles FOR SELECT
  TO anon
  USING (false);
