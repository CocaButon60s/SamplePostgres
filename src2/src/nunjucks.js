import nunjucks from "nunjucks";
const loader = new nunjucks.WebLoader("/templates");
const env = new nunjucks.Environment(loader);

export default env;
