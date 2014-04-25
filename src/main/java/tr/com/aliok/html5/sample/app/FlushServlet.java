/*
 * Copyright 2014 Ali Ok
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package tr.com.aliok.html5.sample.app;

import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(urlPatterns = "/flush")
public class FlushServlet extends javax.servlet.http.HttpServlet {

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        super.service(req, res);
    }

    // do nothing. Just write received stuff to console and return the number of received parsed activities.
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String activitiesParam = req.getParameter("activities");

        Gson gson = new Gson();

        final ActivitiesDTO activitiesDTO = gson.fromJson(activitiesParam, ActivitiesDTO.class);

        final ActivityDTO[] activitiesArr = activitiesDTO.getActivitiesArr();

        for (ActivityDTO activityDTO : activitiesArr) {
            System.out.println(activityDTO);
        }

        resp.setContentType("application/json");
        resp.getWriter().write("{\"success\":" + activitiesArr.length + "}");
        resp.getWriter().flush();
    }
}
