/*
 *  A Framework for writing Genetic Algorithms in Javascript using data stored in a Derby database.
 *  Copyright (C) 1997 Oliver Strik
 *	
 *  This file is part of GAFramework
 *
 *  GAFramework is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  GAFramework is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with GAFramework.  If not, see <http://www.gnu.org/licenses/>.
 */

package io.github.kranex.gaframework.engine;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import io.github.kranex.gaframework.GAFramework;

/**
 * @author oli
 *
 *	@since v0.2.0
 */
public class Engine {

	/* declarations for the javascript engine. */
	public ScriptEngine engine;
	public Invocable inv;
	
	/**
	 * javascript engine init method.
	 * 
	 * @param file
	 *            javascript genetic script.
	 * @throws ScriptException
	 * @throws IOException 
	 * @since v0.1.0
	 */
	public Engine(File file) throws ScriptException, IOException{
		GAFramework.debug("init script engine");
		ScriptEngineManager sem = new ScriptEngineManager();
		engine = sem.getEngineByName("JavaScript");
		/*
		 * add the variables BREAK and database to the Scripts global variables.
		 * This is a link of sorts. changes made here affect the variables in
		 * the Script, changes to the variables in the Script affect the
		 * variables here.
		 */
		engine.put("BREAK", GAFramework.BREAK);
		//engine.put("db", GAFramework.database);
		engine.put("table", GAFramework.table);
		File framework = File.createTempFile("GAFramework", ".js");
		final Path destination = framework.toPath();
		final InputStream in = getClass().getResourceAsStream("/GAFramework.js");
		Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
		engine.eval(new FileReader(framework));
		engine.eval(new FileReader(file));
		framework.delete();
		inv = (Invocable) engine;
	}
}

	
