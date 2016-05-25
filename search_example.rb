# This is the barebones of a search I wrote for a social network site that involved a complex set of unique search terms.
# The idea was similar to LinkedIn's search but with some twists unique to the company.

def self.search(search,current_user)
    if search.results && search.results != ""
      res = JSON.parse(search.results)

      id_check = []
      id_final = []

      res.each_with_index do |int, index|
        intentions = Intention.all
        id_check = []
        if int["vendor"] != "Any"
          v = Vendor.find_by("name = ?", int["vendor"])
          intentions = intentions.where(["vendor_id = ?", v.id]) if v != "Any"
        end
        if int["sector"] != "Any"
          sect = Sector.find_by("name = ?", int["sector"])
          intentions = intentions.where(["sector_id = ?", sect.id]) if sect != "Any"
        end

        int_str = ""
        if res[0]["intention"] == "Adopt"
          int_str = "ADOPTION"
        elsif res[0]["intention"] == "Replace"
          int_str = "REPLACING"
        else
          int_str = res[0]["intention"]
        end
        intentions = intentions.where(["intention = ?", int_str.upcase]) if res[0]["intention"] != "Any"
        intentions.each do |i|
          id_check << i.user_id
        end

        if index == 0
          id_final = id_check
        else
          id_final = id_final & id_check
        end
        p id_final

      end

      user_uids = []

      id_final.each do | i |
        user_uids << i.to_s + ".0"
      end

    end



    wids = []
    # search all works and filter current and these
    # then find all users with the id's?
    works = Work.all

    works_arr = []


    if search[:clevel].present? && search[:clevel] == true
      works_clevel = works.where('job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ?', "%Chief%", "%CIO%", "%CISO%", "%CSO%", "%CTO%", "%CMO%", "%CDO%", "%CEO%", "%COO%", "%CFO%")
      works_arr << works_clevel
    end
    if search[:executive].present? && search[:executive] == true
      works_executive = works.where('job_title LIKE ? OR job_title LIKE ?', '%EVP%', '%Executive%')
      works_arr << works_executive
    end
    if search[:president].present? && search[:president] == true
      works_pres = works.where('job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ? OR job_title LIKE ?', '%EVP%', '%SVP%', '%President%', '%AVP%', '%VP%')
      works_arr << works_pres
    end
    if search[:director].present? && search[:president] == true
      works_dir = works.where('job_title LIKE ? OR job_title LIKE ?', '%EVP%', '%Executive%')
      works_arr << works_dir
    end
    if works_arr.length > 1
      p works_arr[1].class
      works = works_arr[0]
      1.upto(works_arr.length - 1) do |i|
        works = works.union(works_arr[i])
      end
    elsif works_arr.length == 1
      works = works_arr[0]
    end

    works = works.where('current'=>true)
    works = works.where(["industry LIKE ?", search[:industry]]) if search[:industry].present?
    works = works.where(["enterprise_size LIKE ?", search[:enterprise]]) if search[:enterprise].present?
    works = works.where(["region LIKE ?", search[:region]]) if search[:region].present?
    works = works.where(["country LIKE ?", search[:country]]) if search[:country].present?
    if search[:organization_type].present?
      if search[:organization_type] == "Publicly Traded"
        works = works.where('public'=>true)
      elsif search[:organization_type] == "Private"
        works = works.where('public'=>false)
      end
    end


    works = works.where(:uid=>user_uids) if search.results.present?

    works.each do |w|
      wids << w.uid.to_s
    end

    users = User.where.not(id: current_user.id)


    if (!search[:industry].present? && !search[:enterprise].present? && !search[:region].present? && !search[:country].present? && !search[:job_title].present? && !search[:organization_type].present? && !search.results.present? && !search[:clevel].present? && !search[:executive].present? && !search[:president].present? && !search[:director].present? && !search[:principal].present? && !search[:head].present? && !search[:senior].present? && !search[:lead].present? && !search[:manager].present? && !search[:architect].present? && !search[:infrastructure].present? && !search[:engineer].present? && !search[:consultant].present? && !search[:security].present? && !search[:administrator].present? && !search[:analyst].present? && !search[:risk].present?)
    else
      users = users.where(:uid=>wids)
      p users.length
    end


    return users
  end
