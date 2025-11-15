"use client"

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Phone, Code, Briefcase, GraduationCap, Award, User, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ThemeToggle from '@/components/ThemeToggle'
import profileData from '@/data/profile.json'

export default function Home() {
  const { personal, skills, experience, projects, education, certifications } = profileData

  return (
    <div className="min-h-screen">
      <ThemeToggle />
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Tabs defaultValue="about" className="w-full">
            <div className="sticky top-4 z-40 mx-4 md:mx-8">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 p-2 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-lg h-auto">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="certifications" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certifications
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 md:p-8">
              {/* About Tab */}
              <TabsContent value="about">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-12"
                >
                  <motion.h1
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  >
                    {personal.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-muted-foreground mb-2"
                  >
                    {personal.title}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg md:text-xl font-medium text-blue-400 mb-8"
                  >
                    {personal.slogan}
                  </motion.p>
                  
                  {/* Contact Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-8"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {personal.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {personal.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {personal.email}
                    </div>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex justify-center gap-6 mb-12"
                  >
                    <a href={`https://github.com/${personal.github}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-400 transition-colors">
                      <Github className="w-6 h-6" />
                    </a>
                    <a href={`https://linkedin.com/in/${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-400 transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </motion.div>
                </motion.div>

                {/* About Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{personal.about}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills Section */}
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Programming Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {skills.programmingLanguages.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Frameworks & Databases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {skills.frameworks.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Native & DevOps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {skills.cloudDevOps.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience">
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group" onClick={() => window.open(exp.link, '_blank')}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {exp.title}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription>
                          {exp.company} • {exp.duration} • {exp.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{exp.description}</p>
                        <div className="text-sm">
                          <strong>Tech Stack:</strong> {exp.techStack}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group" onClick={() => window.open(project.link, '_blank')}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {project.name}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{project.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education">
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group" onClick={() => window.open(edu.link, '_blank')}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {edu.degree}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription>
                          {edu.institution} • {edu.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-2">{edu.details}</p>
                        {edu.grade && <p className="text-sm font-medium text-green-400">{edu.grade}</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications">
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group" onClick={() => window.open(cert.link, '_blank')}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <p className="text-sm">{cert.name}</p>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}