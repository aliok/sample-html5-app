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

import javax.servlet.*;
import java.io.IOException;

/**
 * @author Ali Ok (ali.ok@apache.org)
 */
public class ManifestFilter implements Filter {
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        //manifest files need to be served with this mime type, else browser complains about it
        response.setContentType("text/cache-manifest");
        chain.doFilter(request, response);
    }

    public void destroy() {
    }
}
