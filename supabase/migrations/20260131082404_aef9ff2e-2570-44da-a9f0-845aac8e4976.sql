-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  genre TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  script_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scenes table
CREATE TABLE public.scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  location TEXT,
  time_of_day TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shots table
CREATE TABLE public.shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  shot_number INTEGER NOT NULL,
  camera_angle TEXT NOT NULL DEFAULT 'Eye-level',
  shot_size TEXT NOT NULL DEFAULT 'Medium',
  movement TEXT DEFAULT 'Static',
  equipment TEXT DEFAULT 'Tripod',
  duration INTEGER NOT NULL DEFAULT 3,
  focal_length TEXT DEFAULT '50mm',
  description TEXT NOT NULL,
  dialogue TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create characters table
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  appearance TEXT,
  clothing TEXT,
  reference_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storyboard_panels table
CREATE TABLE public.storyboard_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shot_id UUID NOT NULL REFERENCES public.shots(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  seed TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for storyboard images
INSERT INTO storage.buckets (id, name, public) VALUES ('storyboard-images', 'storyboard-images', true);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboard_panels ENABLE ROW LEVEL SECURITY;

-- Projects policies - users can only access their own projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Scenes policies - users can access scenes through their projects
CREATE POLICY "Users can view scenes of their projects" ON public.scenes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = scenes.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create scenes in their projects" ON public.scenes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = scenes.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update scenes in their projects" ON public.scenes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = scenes.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete scenes in their projects" ON public.scenes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = scenes.project_id AND user_id = auth.uid())
  );

-- Shots policies
CREATE POLICY "Users can view shots of their scenes" ON public.shots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = shots.scene_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create shots in their scenes" ON public.shots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = shots.scene_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update shots in their scenes" ON public.shots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = shots.scene_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete shots in their scenes" ON public.shots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = shots.scene_id AND p.user_id = auth.uid()
    )
  );

-- Characters policies
CREATE POLICY "Users can view characters of their projects" ON public.characters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = characters.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create characters in their projects" ON public.characters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = characters.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update characters in their projects" ON public.characters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = characters.project_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete characters in their projects" ON public.characters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = characters.project_id AND user_id = auth.uid())
  );

-- Storyboard panels policies
CREATE POLICY "Users can view panels of their shots" ON public.storyboard_panels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.scenes sc ON sh.scene_id = sc.id
      JOIN public.projects p ON sc.project_id = p.id
      WHERE sh.id = storyboard_panels.shot_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create panels in their shots" ON public.storyboard_panels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.scenes sc ON sh.scene_id = sc.id
      JOIN public.projects p ON sc.project_id = p.id
      WHERE sh.id = storyboard_panels.shot_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update panels in their shots" ON public.storyboard_panels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.scenes sc ON sh.scene_id = sc.id
      JOIN public.projects p ON sc.project_id = p.id
      WHERE sh.id = storyboard_panels.shot_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete panels in their shots" ON public.storyboard_panels
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.scenes sc ON sh.scene_id = sc.id
      JOIN public.projects p ON sc.project_id = p.id
      WHERE sh.id = storyboard_panels.shot_id AND p.user_id = auth.uid()
    )
  );

-- Storage policies for storyboard images
CREATE POLICY "Anyone can view storyboard images" ON storage.objects
  FOR SELECT USING (bucket_id = 'storyboard-images');
CREATE POLICY "Authenticated users can upload storyboard images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'storyboard-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own storyboard images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'storyboard-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own storyboard images" ON storage.objects
  FOR DELETE USING (bucket_id = 'storyboard-images' AND auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();