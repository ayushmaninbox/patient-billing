@echo off
java -Dmaven.multiModuleProjectDirectory=. -classpath .mvn\wrapper\maven-wrapper.jar org.apache.maven.wrapper.MavenWrapperMain %*
