"use client"

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Phone, Code, Briefcase, GraduationCap, Award } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import profileData from '@/data/profile.json'

export default function Home() {
  const { personal, skills, experience, projects, education, certifications } = profileData

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
            <a href={`https://github.com/${personal.github}`} className="text-muted-foreground hover:text-blue-400 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href={`https://linkedin.com/in/${personal.linkedin}`} className="text-muted-foreground hover:text-blue-400 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Skills
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

            {/* Skills Tab */}
            <TabsContent value="skills">
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
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
                  transition={{ delay: 0.4 }}
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
                  transition={{ delay: 0.6 }}
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
                    <Card>
                      <CardHeader>
                        <CardTitle>{exp.title}</CardTitle>
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
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
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
                    <Card>
                      <CardHeader>
                        <CardTitle>{edu.degree}</CardTitle>
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
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm">{cert}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}