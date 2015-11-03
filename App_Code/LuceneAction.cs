using System.Collections.Generic;
using System.IO;
using System.Linq;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.QueryParsers;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;

public static class LuceneAction
{
    private const int hits_limit = 1;

    public static List<string> SearchLucene(string searchQuery)
    {
        var directory = FSDirectory.Open(new DirectoryInfo("C:\\rm_index"));
        using (var searcher = new IndexSearcher(directory, false))
        {
            var analyzer = new StandardAnalyzer(Version.LUCENE_30);
            var parser = new QueryParser(Version.LUCENE_30, "DIRECCION_FINAL", analyzer);
            var query = ParseQuery(searchQuery, parser);
            var hits = searcher.Search(query, hits_limit).ScoreDocs;
            var results = hits.Select(hit => MapLuceneDocumentToData(searcher.Doc(hit.Doc))).ToList();
            analyzer.Close();
            searcher.Dispose();
            return results;
        }
    }

    private static Query ParseQuery(string searchQuery, QueryParser parser)
    {
        Query query;
        try
        {
            query = parser.Parse(searchQuery.Trim());
        }
        catch (ParseException)
        {
            query = parser.Parse(QueryParser.Escape(searchQuery.Trim()));
        }
        return query;
    }

    private static string MapLuceneDocumentToData(Document doc)
    {
        return doc.Get("CLIENTE_BOLETA");
    }
}